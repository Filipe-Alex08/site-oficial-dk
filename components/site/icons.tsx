import type { SVGProps } from "react";

/**
 * Ícones próprios no padrão do lucide (grade 24, traço 2, pontas e junções arredondadas, currentColor)
 * para o que a biblioteca não tem: lança, escudo redondo e o emblema de graduação.
 * Foram desenhados ao lado de sword, shield, crown e castle do lucide para ter o mesmo peso e ritmo.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

function Icon({ size = 24, children, ...props }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

/** Lança: haste e ponta em folha. */
export function SpearIcon(props: IconProps) {
  return <Icon {...props}><path d="M13 11 4 20" /><path d="m13 11 1.8-6.4 5.7-1.1-1.1 5.7z" /><path d="m3 21 1.5-1.5" /></Icon>;
}

/** Escudo redondo (broquel) com umbo e rebites. */
export function RoundShieldIcon(props: IconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M7.5 7.5h.01M16.5 7.5h.01M7.5 16.5h.01M16.5 16.5h.01" /></Icon>;
}

/** Graduação: o escudo do lucide com duas divisas, como uma insígnia de patente. */
export function GraduationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 11 3-2.5 3 2.5" />
      <path d="m9 15 3-2.5 3 2.5" />
    </Icon>
  );
}
