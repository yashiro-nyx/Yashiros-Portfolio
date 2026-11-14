import {
  CERTIFICATIONS,
  EXPERIENCES,
  PROFILE_DATA,
  PROJECTS,
  SKILL_GROUPS,
} from '../data/portfolioData';

/**
 * Escapes characters for PDF literal strings (...) and normalizes Unicode punctuation to WinAnsi.
 */
function escapePdfText(input: string): string {
  return input
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, ' - ')
    .replace(/[\u00B7\u2022\u25CF]/g, '-')
    .replace(/\u2197/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Word-wraps a string to fit within a maximum character width per line.
 */
function wrapText(text: string, maxChars: number): string[] {
  const clean = escapePdfText(text);
  if (!clean) return [];
  const words = clean.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Generates and downloads a clean, multi-page vector PDF resume (PDF 1.4 standard)
 * using built-in Type1 fonts (Helvetica, Helvetica-Bold, Times-Italic, Courier)
 * so it works 100% offline and inside sandboxed preview iframes.
 */
export function downloadResumePdf(): void {
  const pageWidth = 612; // 8.5 in (Letter)
  const pageHeight = 792; // 11 in (Letter)
  const marginX = 46;
  const topY = pageHeight - 48;
  const bottomLimitY = 52;
  const contentWidth = pageWidth - marginX * 2;

  const pages: string[][] = [[]];
  let currentPageIdx = 0;
  let cursorY = topY;

  const currentOps = () => pages[currentPageIdx];

  const ensureSpace = (neededHeight: number) => {
    if (cursorY - neededHeight < bottomLimitY) {
      pages.push([]);
      currentPageIdx = pages.length - 1;
      cursorY = topY;
    }
  };

  // Helper: draw horizontal line
  const drawRule = (y: number, gray = 0.82, thickness = 0.75) => {
    currentOps().push(
      `${gray.toFixed(2)} ${gray.toFixed(2)} ${gray.toFixed(2)} RG`,
      `${thickness.toFixed(2)} w`,
      `${marginX} ${y.toFixed(2)} m ${pageWidth - marginX} ${y.toFixed(2)} l S`
    );
  };

  // Helper: draw accent bar
  const drawAccentLine = (y: number) => {
    currentOps().push(
      `0.31 0.52 0.75 RG`,
      `1.4 w`,
      `${marginX} ${y.toFixed(2)} m ${pageWidth - marginX} ${y.toFixed(2)} l S`
    );
  };

  // Helper: draw single line of text
  // Font keys: /F1 = Helvetica, /F2 = Helvetica-Bold, /F3 = Times-Italic, /F4 = Courier
  const drawText = (
    text: string,
    x: number,
    y: number,
    font: 'F1' | 'F2' | 'F3' | 'F4',
    size: number,
    rgb: [number, number, number] = [0.08, 0.09, 0.12]
  ) => {
    const safe = escapePdfText(text);
    if (!safe) return;
    currentOps().push(
      'BT',
      `/${font} ${size} Tf`,
      `${rgb[0].toFixed(3)} ${rgb[1].toFixed(3)} ${rgb[2].toFixed(3)} rg`,
      `${x.toFixed(2)} ${y.toFixed(2)} Td`,
      `(${safe}) Tj`,
      'ET'
    );
  };

  // Helper: draw section heading
  const drawSectionHeading = (label: string) => {
    ensureSpace(34);
    cursorY -= 8;
    drawText(label.toUpperCase(), marginX, cursorY, 'F4', 8.5, [
      0.24, 0.46, 0.7,
    ]);
    cursorY -= 6;
    drawRule(cursorY, 0.84, 0.6);
    cursorY -= 14;
  };

  // =========================================================================
  // 1. HEADER: Name, Title & Contact Details
  // =========================================================================
  drawText(
    "CURRICULUM VITAE - YASHIRO'S PORTFOLIO (@YASHIRO-NYX)",
    marginX,
    cursorY,
    'F4',
    8,
    [0.24, 0.46, 0.7]
  );
  cursorY -= 24;

  drawText(PROFILE_DATA.fullName, marginX, cursorY, 'F2', 22, [
    0.06, 0.07, 0.1,
  ]);
  cursorY -= 16;

  drawText(PROFILE_DATA.title, marginX, cursorY, 'F1', 10.5, [
    0.28, 0.31, 0.36,
  ]);
  cursorY -= 15;

  drawText(
    `${PROFILE_DATA.school}  |  ${PROFILE_DATA.location}`,
    marginX,
    cursorY,
    'F1',
    8.8,
    [0.32, 0.35, 0.4]
  );
  cursorY -= 13;

  drawText(
    `Email: ${PROFILE_DATA.email}  |  GitHub: github.com/yashiro-nyx  |  LinkedIn: linkedin.com/in/jervin-paul-romualdo-464319323`,
    marginX,
    cursorY,
    'F4',
    7.8,
    [0.24, 0.46, 0.7]
  );
  cursorY -= 10;
  drawAccentLine(cursorY);
  cursorY -= 12;

  // =========================================================================
  // 2. PROFESSIONAL SUMMARY
  // =========================================================================
  drawSectionHeading('01 / Professional Summary');
  const bioLines = wrapText(PROFILE_DATA.aboutBio, 98);
  for (const line of bioLines) {
    ensureSpace(13);
    drawText(line, marginX, cursorY, 'F1', 9.2, [0.18, 0.2, 0.24]);
    cursorY -= 12.5;
  }
  cursorY -= 4;

  // =========================================================================
  // 3. EDUCATION & ENGINEERING HIGHLIGHTS
  // =========================================================================
  drawSectionHeading('02 / Education & Engineering Highlights');
  for (const exp of EXPERIENCES) {
    ensureSpace(42);
    drawText(
      `${exp.title}  -  ${exp.organization}`,
      marginX,
      cursorY,
      'F2',
      9.8,
      [0.08, 0.09, 0.12]
    );
    drawText(
      exp.period,
      pageWidth - marginX - exp.period.length * 4.8,
      cursorY,
      'F4',
      8.2,
      [0.35, 0.38, 0.44]
    );
    cursorY -= 13;

    for (const hl of exp.highlights) {
      const hlLines = wrapText(`- ${hl}`, 96);
      for (let i = 0; i < hlLines.length; i++) {
        ensureSpace(12);
        drawText(
          hlLines[i],
          marginX + (i === 0 ? 6 : 14),
          cursorY,
          'F1',
          8.8,
          [0.22, 0.25, 0.3]
        );
        cursorY -= 11.5;
      }
    }
    cursorY -= 5;
  }

  // =========================================================================
  // 4. SELECTED SOFTWARE & DESIGN PROJECTS (08)
  // =========================================================================
  drawSectionHeading('03 / Selected Engineering & Design Projects');
  for (const proj of PROJECTS) {
    ensureSpace(44);
    const headerLeft = `${proj.name} (${proj.role})`;
    const headerRight = `${proj.year} | ${proj.techStack.slice(0, 4).join(', ')}`;
    drawText(headerLeft, marginX, cursorY, 'F2', 9.5, [0.08, 0.09, 0.12]);
    drawText(
      headerRight,
      Math.max(marginX + 240, pageWidth - marginX - headerRight.length * 4.3),
      cursorY,
      'F4',
      7.5,
      [0.24, 0.46, 0.7]
    );
    cursorY -= 12;

    const probLines = wrapText(proj.problemSolved, 98);
    for (const line of probLines) {
      ensureSpace(11.5);
      drawText(line, marginX + 6, cursorY, 'F1', 8.6, [0.22, 0.25, 0.3]);
      cursorY -= 11;
    }
    cursorY -= 4.5;
  }

  // =========================================================================
  // 5. TECHNICAL SKILLS
  // =========================================================================
  drawSectionHeading('04 / Technical Skills & Stack');
  for (const group of SKILL_GROUPS) {
    ensureSpace(22);
    const label = `${group.category}: `;
    const skillsStr = group.skills.join('  -  ');
    drawText(label, marginX, cursorY, 'F2', 8.8, [0.08, 0.09, 0.12]);
    const wrappedSkills = wrapText(skillsStr, 74);
    for (let i = 0; i < wrappedSkills.length; i++) {
      if (i > 0) ensureSpace(11.5);
      drawText(
        wrappedSkills[i],
        marginX + 148,
        cursorY,
        'F1',
        8.6,
        [0.2, 0.23, 0.28]
      );
      cursorY -= 11.5;
    }
    cursorY -= 2;
  }

  // =========================================================================
  // 6. VERIFIED CERTIFICATIONS (12)
  // =========================================================================
  drawSectionHeading(`05 / Verified Certifications (${CERTIFICATIONS.length})`);
  const colWidth = contentWidth / 2;
  for (let i = 0; i < CERTIFICATIONS.length; i += 2) {
    ensureSpace(14);
    const leftCert = CERTIFICATIONS[i];
    const rightCert = CERTIFICATIONS[i + 1];

    drawText(
      `- ${leftCert.title} (${leftCert.issuer})`,
      marginX,
      cursorY,
      'F1',
      8.3,
      [0.16, 0.18, 0.22]
    );
    if (rightCert) {
      drawText(
        `- ${rightCert.title} (${rightCert.issuer})`,
        marginX + colWidth,
        cursorY,
        'F1',
        8.3,
        [0.16, 0.18, 0.22]
      );
    }
    cursorY -= 12;
  }

  // Add subtle footer on each page
  pages.forEach((ops, idx) => {
    ops.push(
      `0.85 0.85 0.85 RG`,
      `0.5 w`,
      `${marginX} 36 m ${pageWidth - marginX} 36 l S`,
      'BT',
      '/F4 7.5 Tf',
      '0.45 0.48 0.52 rg',
      `${marginX} 24 Td`,
      `(${escapePdfText(`${PROFILE_DATA.fullName} (@${PROFILE_DATA.handle}) - Curriculum Vitae`)}) Tj`,
      'ET',
      'BT',
      '/F4 7.5 Tf',
      '0.45 0.48 0.52 rg',
      `${pageWidth - marginX - 54} 24 Td`,
      `(Page ${idx + 1} of ${pages.length}) Tj`,
      'ET'
    );
  });

  // =========================================================================
  // Assemble PDF 1.4 Byte Stream
  // =========================================================================
  const objects: string[] = [];
  const addObj = (body: string): number => {
    objects.push(body);
    return objects.length;
  };

  // Obj 1: Catalog (placeholder, updated after Pages object)
  addObj('');
  // Obj 2: Pages (placeholder)
  addObj('');
  // Obj 3..6: Standard Type1 Fonts
  const fontF1 = addObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'
  );
  const fontF2 = addObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'
  );
  const fontF3 = addObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Times-Italic /Encoding /WinAnsiEncoding >>'
  );
  const fontF4 = addObj(
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>'
  );

  const pageObjIds: number[] = [];

  for (const pageOps of pages) {
    const streamContent = pageOps.join('\n');
    const contentObjId = addObj(
      `<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream`
    );
    const pageObjId = addObj(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontF1} 0 R /F2 ${fontF2} 0 R /F3 ${fontF3} 0 R /F4 ${fontF4} 0 R >> >> /Contents ${contentObjId} 0 R >>`
    );
    pageObjIds.push(pageObjId);
  }

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Jervin_Paul_Romualdo_Resume_CV.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}
