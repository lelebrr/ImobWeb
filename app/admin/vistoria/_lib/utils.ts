export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// CEP lookup via API route (avoids CSP issues)
export async function lookupCep(cep: string): Promise<{ endereco: string; bairro: string; cidade: string; estado: string } | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`/api/admin/vistoria/cep/${clean}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return { endereco: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' };
  } catch { return null; }
}

// CPF/CNPJ validation
export function validateCpfCnpj(value: string): { valid: boolean; type: 'CPF' | 'CNPJ' | 'invalid' } {
  const clean = value.replace(/\D/g, '');
  if (clean.length === 11) {
    // CPF validation
    if (/^(\d)\1{10}$/.test(clean)) return { valid: false, type: 'invalid' };
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean[9])) return { valid: false, type: 'invalid' };
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean[10])) return { valid: false, type: 'invalid' };
    return { valid: true, type: 'CPF' };
  }
  if (clean.length === 14) {
    // CNPJ validation
    if (/^(\d)\1{13}$/.test(clean)) return { valid: false, type: 'invalid' };
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += parseInt(clean[i]) * weights1[i];
    let rev = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (rev !== parseInt(clean[12])) return { valid: false, type: 'invalid' };
    sum = 0;
    for (let i = 0; i < 13; i++) sum += parseInt(clean[i]) * weights2[i];
    rev = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (rev !== parseInt(clean[13])) return { valid: false, type: 'invalid' };
    return { valid: true, type: 'CNPJ' };
  }
  return { valid: false, type: 'invalid' };
}

// Format CPF/CNPJ
export function formatCpfCnpj(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 11) {
    return clean.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return clean.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

// Format phone
export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length <= 10) {
    return clean.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
  }
  return clean.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2');
}


// Format CEP with hyphen
export function formatCep(value: string): string {
  const clean = value.replace(/\D/g, '');
  if (clean.length > 5) return clean.slice(0, 5) + '-' + clean.slice(5, 8);
  return clean;
}


export const uid = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
