import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { HlsVideoBackground } from './HlsVideoBackground';
import { Magnetic } from './Magnetic';
import { StaggerContainer, FadeInUpItem } from './StaggerFadeInUp';
import TearTicket from './TearTicket';
import ticketStudioArtwork from '../assets/images/ticket_studio_artwork_1794537525577.jpg';
import { PROFILE_DATA } from '../data/portfolioData';

interface FooterProps {
  onOpenContact: () => void;
  onOpenResume: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenContact,
  onOpenResume,
}) => {
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const [ticketUsed, setTicketUsed] = useState(false);

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        xPercent: -50,
        duration: 40,
        ease: 'none',
        repeat: -1,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const marqueeText = Array.from({ length: 10 })
    .map(() => 'BUILDING THE FUTURE • ')
    .join('');

  return (
    <footer
      id="contact"
      tabIndex={-1}
      aria-label="Contact and Footer"
      className="relative bg-bg pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden focus:outline-none"
    >
      {/* Background Galaxy + Video (Flipped Vertically scale-y-[-1]) */}
      <HlsVideoBackground
        flipped
        overlayClassName="bg-white/25 dark:bg-black/30"
      />

      {/* Top Fade from bg */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-bg to-transparent pointer-events-none z-[1]" />

      <div className="relative z-10">
        {/* GSAP Infinite Marquee */}
        <div className="w-full overflow-hidden py-6 mb-10 md:mb-14 select-none">
          <div
            ref={marqueeRef}
            className="flex whitespace-nowrap w-max text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display italic text-text-primary/90 tracking-tight leading-none"
          >
            <span className="pr-4">{marqueeText}</span>
            <span className="pr-4">{marqueeText}</span>
          </div>
        </div>

        {/* Center CTA with Staggered Fade-In-Up Text Entrance */}
        <StaggerContainer
          staggerDelay={0.1}
          viewportMargin="-24px 0px -24px 0px"
          className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 text-center flex flex-col items-center mb-16 md:mb-20"
        >
          <FadeInUpItem
            as="p"
            className="text-xs text-muted uppercase tracking-[0.3em] mb-4"
          >
            Ready to collaborate?
          </FadeInUpItem>
          <FadeInUpItem
            as="h2"
            className="text-3xl sm:text-5xl md:text-6xl font-light text-text-primary tracking-tight max-w-2xl mb-8"
          >
            Let&apos;s build your next{' '}
            <span className="font-display italic">digital product</span>{' '}
            together.
          </FadeInUpItem>

          {/* Interactive Perforated Collaboration Pass (TearTicket) */}
          <FadeInUpItem className="w-full flex flex-col items-center mb-12">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-surface/80 border border-stroke px-3.5 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-[#89AACC]">
              <span>✂ Drag &amp; tear the stub to send a direct message</span>
            </div>

            <div
              className={`w-full flex justify-center py-4 ${
                ticketUsed ? 'cursor-pointer' : ''
              }`}
              onClick={ticketUsed ? onOpenContact : undefined}
              title={ticketUsed ? 'Click to open message form' : undefined}
            >
              <TearTicket
                image={ticketStudioArtwork}
                imageAlt="Cosmic 3D iridescent glass torus and brushed dark titanium icosahedron illuminated by ice-blue starlight"
                torn={ticketUsed}
                onTear={() => {
                  setTicketUsed(true);
                  onOpenContact();
                }}
                orientation="horizontal"
                scrim
                imageRadius={10}
                width={460}
                height={250}
                stubSize={154}
                radius={16}
                holes={12}
                holeSize={6}
                notch={3}
                roughness={0}
                tearAngle={30}
                stretch={30}
                resistance={0.45}
                rotate={4}
                tilt
                tiltMax={9}
                tiltReach={260}
                parallax={7}
                perspective={1000}
                background="#0f1218"
                stubBackground="#141821"
                color="#f5f5f5"
                accentColor="#89AACC"
                border
                borderColor="rgba(137, 170, 204, 0.28)"
                borderWidth={1}
                recenter
                ariaLabel="Tear off the studio collaboration pass stub to open the direct message form"
                stub={
                  <div className="h-full w-full p-4 pl-5 flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#89AACC]">
                          DIRECT PASS
                        </span>
                        <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-[#61dca3]/15 text-[#61dca3] border border-[#61dca3]/30">
                          OPEN
                        </span>
                      </div>
                      <h3 className="font-display italic text-xl text-[#f5f5f5] leading-tight">
                        Admit One
                      </h3>
                      <p className="text-[11px] text-zinc-400 leading-snug mt-1">
                        Full-Stack Web, Mobile &amp; UI/UX
                      </p>
                    </div>

                    <div className="border-t border-white/10 pt-2.5 flex flex-col gap-1.5">
                      {/* Minimal vector barcode motif */}
                      <div className="flex items-center gap-[2px] h-3.5 opacity-65" aria-hidden="true">
                        {[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 2, 3, 1, 2, 1, 2].map(
                          (w, idx) => (
                            <span
                              key={idx}
                              style={{ width: `${w}px` }}
                              className="h-full bg-[#89AACC]/80 rounded-[0.5px]"
                            />
                          )
                        )}
                      </div>
                      <div className="flex items-center justify-between font-mono text-[9.5px]">
                        <span className="text-[#89AACC]">✂ Tear Stub</span>
                        <span className="text-zinc-400 tracking-wider">
                          JP-2604
                        </span>
                      </div>
                    </div>
                  </div>
                }
              >
                <div className="h-full w-full p-4 flex flex-col justify-between text-left pointer-events-none">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#f5f5f5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#61dca3]" />
                      <span>Collection &apos;26 · @yashiro-nyx</span>
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#89AACC]/90 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-[#89AACC]/25">
                      BSIT · TIP-QC
                    </span>
                  </div>

                  <div className="pt-2">
                    <span className="block font-display italic text-2xl sm:text-[26px] text-[#f5f5f5] leading-none tracking-tight">
                      Jervin Paul Romualdo
                    </span>
                    <div className="flex items-center justify-between gap-2 mt-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#89AACC]">
                        Project Collaboration Pass
                      </span>
                      <span className="font-mono text-[9px] text-zinc-400">
                        QUEZON CITY · PH
                      </span>
                    </div>
                  </div>
                </div>
              </TearTicket>
            </div>

            {ticketUsed && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="px-4 py-1.5 rounded-full bg-[#89AACC] text-[#0a0a0a] font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Open Message Form ↗
                </button>
                <button
                  type="button"
                  onClick={() => setTicketUsed(false)}
                  className="px-4 py-1.5 rounded-full bg-surface border border-stroke hover:border-[#89AACC] text-muted hover:text-text-primary transition-colors cursor-pointer"
                >
                  Restore Ticket ↺
                </button>
              </div>
            )}
          </FadeInUpItem>

          <FadeInUpItem className="flex flex-wrap items-center justify-center gap-4">
            {/* Primary Email CTA with gradient hover border ring */}
            <Magnetic strength={0.4}>
              <a
                href={`mailto:${PROFILE_DATA.email}`}
                className="group relative inline-block rounded-full p-[2px] transition-transform duration-300 hover:scale-105"
              >
                <span className="absolute inset-0 rounded-full accent-gradient" />
                <span className="relative inline-flex items-center gap-2.5 rounded-full bg-bg group-hover:bg-surface px-7 py-4 text-sm sm:text-base font-medium text-text-primary transition-colors">
                  <span>{PROFILE_DATA.email}</span>
                  <span className="text-[#89AACC]">↗</span>
                </span>
              </a>
            </Magnetic>

            {/* Interactive Inquiry Modal Button */}
            <Magnetic strength={0.4}>
              <button
                type="button"
                onClick={onOpenContact}
                className="group relative rounded-full p-[2px] transition-transform duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="absolute inset-0 rounded-full bg-stroke group-hover:opacity-0 transition-opacity" />
                <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative inline-flex items-center gap-2 rounded-full bg-surface px-7 py-4 text-sm sm:text-base font-medium text-text-primary">
                  <span>Send Interactive Message</span>
                  <span>→</span>
                </span>
              </button>
            </Magnetic>

            <Magnetic strength={0.35}>
              <button
                type="button"
                onClick={onOpenResume}
                className="inline-flex items-center gap-2 rounded-full bg-surface/80 border border-stroke hover:border-[#89AACC] px-6 py-4 text-sm text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <span>View Resume</span>
              </button>
            </Magnetic>
          </FadeInUpItem>
        </StaggerContainer>

        {/* Footer Bottom Bar */}
        <StaggerContainer
          staggerDelay={0.1}
          viewportMargin="-30px"
          className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-16 pt-8 border-t border-stroke flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted"
        >
          {/* Social Links */}
          <FadeInUpItem
            subtle
            className="flex flex-wrap items-center justify-center gap-6"
          >
            <Magnetic strength={0.3}>
              <a
                href={PROFILE_DATA.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors inline-block py-1"
              >
                GitHub
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href={PROFILE_DATA.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors inline-block py-1"
              >
                LinkedIn
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href={PROFILE_DATA.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors inline-block py-1"
              >
                Instagram
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href={PROFILE_DATA.socials.draftPortfolioRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-primary transition-colors inline-block py-1"
              >
                Yashiro-Portfolio
              </a>
            </Magnetic>
          </FadeInUpItem>

          {/* Availability & Copyright */}
          <FadeInUpItem
            subtle
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <span className="text-text-primary font-medium">
              Available for projects &amp; internships
            </span>
            <span aria-hidden="true">·</span>
            <span>© {new Date().getFullYear()} {PROFILE_DATA.fullName}</span>
          </FadeInUpItem>
        </StaggerContainer>
      </div>
    </footer>
  );
};
