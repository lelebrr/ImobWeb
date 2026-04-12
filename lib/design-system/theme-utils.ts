/**
 * Utilitários para gestão dinâmica de temas White Label
 * Converte tokens de design em variáveis CSS injetadas no :root
 */

export interface ThemeConfig {
  primary: string; // HSL format: "221.2 83.2% 53.3%"
  radius?: string;
  fontSans?: string;
  logoUrl?: string;
}

export function generateThemeCSS(config: ThemeConfig): string {
  return `
    :root {
      --primary: ${config.primary};
      ${config.radius ? `--radius: ${config.radius};` : ''}
    }
  `;
}

/**
 * Injeta o tema dinamicamente no documento
 */
export function applyTheme(config: ThemeConfig) {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  // Aplica a cor primária
  root.style.setProperty('--primary', config.primary);
  
  // Calcula e aplica o ring baseado na primária (opcionalmente)
  root.style.setProperty('--ring', config.primary);

  if (config.radius) {
    root.style.setProperty('--radius', config.radius);
  }
}

/**
 * Helper para detectar contraste e definir cor de foreground (texto sobre primária)
 */
export function getContrastColor(hsl: string): string {
  // Lógica simplificada: se a luminosidade for alta, texto preto. Se for baixa, texto branco.
  const match = hsl.match(/(\d+(\.\d+)?)%/);
  if (!match) return '0 0% 100%';
  
  const lightness = parseFloat(match[1]);
  return lightness > 60 ? '222.2 84% 4.9%' : '210 40% 98%';
}
