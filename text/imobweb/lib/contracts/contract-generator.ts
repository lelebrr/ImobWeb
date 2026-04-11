import type {
  Contract,
  ContractType,
  ContractClause,
  ContractProperty,
  ContractParty,
  ContractTemplate,
  ContractClause as ClauseType
} from '@/types/contracts';

const CLAUSE_TEMPLATES: Record<ContractType, ContractClause[]> = {
  sale: [
    {
      id: 'parties',
      title: 'Partes',
      content: '',
      order: 1,
      required: true
    },
    {
      id: 'object',
      title: 'Objeto',
      content: '',
      order: 2,
      required: true
    },
    {
      id: 'price',
      title: 'Preço e Forma de Pagamento',
      content: '',
      order: 3,
      required: true
    },
    {
      id: 'delivery',
      title: 'Entrega do Imóvel',
      content: '',
      order: 4,
      required: true
    },
    {
      id: ' warranties',
      title: 'Garantias',
      content: '',
      order: 5,
      required: false
    },
    {
      id: 'obligations',
      title: 'Obrigações das Partes',
      content: '',
      order: 6,
      required: false
    },
    {
      id: 'penalties',
      title: 'Multas e Penalidades',
      content: '',
      order: 7,
      required: false
    },
    {
      id: 'termination',
      title: 'Rescisão',
      content: '',
      order: 8,
      required: false
    },
    {
      id: 'disputes',
      title: 'Foro',
      content: '',
      order: 9,
      required: true
    }
  ],
  rent: [
    {
      id: 'parties',
      title: 'Partes',
      content: '',
      order: 1,
      required: true
    },
    {
      id: 'object',
      title: 'Objeto',
      content: '',
      order: 2,
      required: true
    },
    {
      id: 'term',
      title: 'Prazo',
      content: '',
      order: 3,
      required: true
    },
    {
      id: 'rent_value',
      title: 'Valor do Aluguel',
      content: '',
      order: 4,
      required: true
    },
    {
      id: 'payment',
      title: 'Pagamento',
      content: '',
      order: 5,
      required: true
    },
    {
      id: 'guaranty',
      title: 'Garantia',
      content: '',
      order: 6,
      required: false
    },
    {
      id: 'maintenance',
      title: 'Conservação e Reparos',
      content: '',
      order: 7,
      required: false
    },
    {
      id: 'use',
      title: 'Uso do Imóvel',
      content: '',
      order: 8,
      required: false
    },
    {
      id: 'termination',
      title: 'Rescisão',
      content: '',
      order: 9,
      required: false
    },
    {
      id: 'disputes',
      title: 'Foro',
      content: '',
      order: 10,
      required: true
    }
  ],
  proposal: [
    {
      id: 'intro',
      title: 'Introdução',
      content: '',
      order: 1,
      required: true
    },
    {
      id: 'property',
      title: 'Imóvel',
      content: '',
      order: 2,
      required: true
    },
    {
      id: 'proposal_value',
      title: 'Valor Proposto',
      content: '',
      order: 3,
      required: true
    },
    {
      id: 'conditions',
      title: 'Condições',
      content: '',
      order: 4,
      required: false
    },
    {
      id: 'validity',
      title: 'Validade',
      content: '',
      order: 5,
      required: true
    },
    {
      id: 'disputes',
      title: 'Foro',
      content: '',
      order: 6,
      required: true
    }
  ],
  authorization: [
    {
      id: 'authorization',
      title: 'Autorização',
      content: '',
      order: 1,
      required: true
    },
    {
      id: 'property',
      title: 'Imóvel',
      content: '',
      order: 2,
      required: true
    },
    {
      id: 'scope',
      title: 'Escopo',
      content: '',
      order: 3,
      required: true
    },
    {
      id: 'term',
      title: 'Prazo',
      content: '',
      order: 4,
      required: true
    },
    {
      id: 'disputes',
      title: 'Foro',
      content: '',
      order: 5,
      required: true
    }
  ],
  commercial: [
    {
      id: 'parties',
      title: 'Partes',
      content: '',
      order: 1,
      required: true
    },
    {
      id: 'object',
      title: 'Objeto',
      content: '',
      order: 2,
      required: true
    },
    {
      id: 'value',
      title: 'Valor',
      content: '',
      order: 3,
      required: true
    },
    {
      id: 'conditions',
      title: 'Condições',
      content: '',
      order: 4,
      required: false
    },
    {
      id: 'disputes',
      title: 'Foro',
      content: '',
      order: 5,
      required: true
    }
  ]
};

export interface ContractGenerationOptions {
  type: ContractType;
  property: ContractProperty;
  parties: ContractParty[];
  totalValue: number;
  installments?: number;
  startDate?: Date;
  endDate?: Date;
  customClauses?: Partial<ContractClause>[];
  variables?: Record<string, string>;
}

export class ContractGenerator {
  generate(options: ContractGenerationOptions): Contract {
    const { type, property, parties, totalValue, installments, startDate, endDate, customClauses, variables } = options;
    
    const clauses = this.buildClauses(type, property, parties, totalValue, installments, startDate, endDate, variables);
    
    const contract: Contract = {
      id: `contract-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      templateId: `template-${type}`,
      type,
      status: 'draft',
      title: this.generateTitle(type, property),
      description: this.generateDescription(type, property, totalValue),
      property,
      parties,
      clauses,
      totalValue,
      installments,
      startDate,
      endDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: '',
      documentVersion: 1
    };

    return contract;
  }

  private generateTitle(type: ContractType, property: ContractProperty): string {
    const typeLabels: Record<ContractType, string> = {
      sale: 'Contrato de Compra e Venda',
      rent: 'Contrato de Locação',
      proposal: 'Proposta Comercial',
      authorization: 'Autorização de Venda',
      commercial: 'Contrato Comercial'
    };

    return `${typeLabels[type]} - ${property.address}`;
  }

  private generateDescription(type: ContractType, property: ContractProperty, value: number): string {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });

    return `Contrato ${type} para o imóvel localizado em ${property.address}, no valor de ${formatter.format(value)}.`;
  }

  private buildClauses(
    type: ContractType,
    property: ContractProperty,
    parties: ContractParty[],
    totalValue: number,
    installments?: number,
    startDate?: Date,
    endDate?: Date,
    variables?: Record<string, string>
  ): ContractClause[] {
    const templateClauses = CLAUSE_TEMPLATES[type];
    const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const buyers = parties.filter(p => p.type === 'buyer' || p.type === 'tenant');
    const sellers = parties.filter(p => p.type === 'seller' || p.type === 'landlord');

    return templateClauses.map(clause => {
      let content = '';

      switch (clause.id) {
        case 'parties':
          if (type === 'sale' || type === 'commercial') {
            content = `VENDEDOR(A): ${sellers.map(s => s.name).join(', ')}, ${sellers[0]?.documentType.toUpperCase()}: ${sellers[0]?.document}. 
COMPRADOR(A): ${buyers.map(b => b.name).join(', ')}, ${buyers[0]?.documentType.toUpperCase()}: ${buyers[0]?.document}.`;
          } else if (type === 'rent') {
            content = `LOCADOR(A): ${sellers.map(s => s.name).join(', ')}, ${sellers[0]?.documentType.toUpperCase()}: ${sellers[0]?.document}.
LOCATÁRIO(A): ${buyers.map(b => b.name).join(', ')}, ${buyers[0]?.documentType.toUpperCase()}: ${buyers[0]?.document}.`;
          } else if (type === 'proposal') {
            content = `PROPONENTE: ${buyers.map(b => b.name).join(', ')}, ${buyers[0]?.documentType.toUpperCase()}: ${buyers[0]?.document}.`;
          }
          break;

        case 'object':
          if (type === 'sale') {
            content = `O presente contrato tem por objeto a compra e venda do imóvel localizado na ${property.address}, ${property.city}-${property.state}, CEP ${property.zipCode}, com área aproximada de ${property.area || 'não informada'} m², comprising ${property.bedrooms || 0} quartos, ${property.bathrooms || 0} banheiros e ${property.parkingSpaces || 0} vagas de garagem.`;
          } else if (type === 'rent') {
            content = `O presente contrato tem por objeto a locação do imóvel localizado na ${property.address}, ${property.city}-${property.state}, CEP ${property.zipCode}, com área aproximada de ${property.area || 'não informada'} m².`;
          } else if (type === 'proposal') {
            content = `Proposta de ${type === 'sale' ? 'compra e venda' : 'locação'} referente ao imóvel localizado na ${property.address}, ${property.city}-${property.state}.`;
          }
          break;

        case 'price':
        case 'rent_value':
        case 'proposal_value':
        case 'value':
          if (installments && installments > 1) {
            const installmentValue = totalValue / installments;
            content = `Valor total: ${formatter.format(totalValue)}. 
Pagamento em ${installments} parcelas de ${formatter.format(installmentValue)} cada, vencendo a primeira em ${startDate ? dateFormatter.format(startDate) : 'data da assinatura'}.`;
          } else {
            content = `Valor total: ${formatter.format(totalValue)}, a ser pago ${type === 'rent' ? 'mensalmente' : 'na assinatura'}according to the following conditions.`;
          }
          break;

        case 'term':
          if (startDate && endDate) {
            content = `Prazo de vigência: ${startDate.getDate()} de ${startDate.toLocaleDateString('pt-BR', { month: 'long' })} de ${startDate.getFullYear()} até ${endDate.getDate()} de ${endDate.toLocaleDateString('pt-BR', { month: 'long' })} de ${endDate.getFullYear()}, totalizando ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))} meses.`;
          } else if (variables?.term) {
            content = `Prazo de vigência: ${variables.term} meses.`;
          } else {
            content = `Prazo: ${installments || 12} meses, renováveis automaticamente por períodos iguais, salvo manifestação contrária de qualquer das partes com antecedência mínima de 30 dias.`;
          }
          break;

        case 'payment':
          content = `O aluguel deverá ser pago até o dia ${variables?.paymentDay || '05'} de cada mês, via ${variables?.paymentMethod || 'depósito bancário'} na conta a ser informada pelo LOCADOR.`;
          break;

        case 'delivery':
          content = `A entrega do imóvel shall occur em até ${variables?.deliveryDays || 30} dias após a assinatura deste contrato e各处 da quitação do valor de entrada. O imóvel será entregue ${variables?.deliveryCondition || 'em perfeito estado de conservação, com as chaves'}传递给COMPRADOR.`;
          break;

        case 'guaranty':
          content = variables?.guarantyType 
            ? `Garantia: ${variables.guarantyType}. ${variables.guarantyDetails || ''}`
            : `O LOCATÁRIO shall provide uma das seguintes garantias: depósito caução, fiador ou seguro fiança.`;
          break;

        case 'validity':
          content = `Esta proposta tem validade de ${variables?.validityDays || 30} dias a partir da data de envio. Após este prazo, deverá ser renovada ou considerada sem efeito.`;
          break;

        case 'disputes':
          content = `Fica eleito o foro da comarca de ${property.city}, ${property.state}, com exclusão de qualquer outro, por mais privilegiado que seja, para dirimir quaisquer questões oriundas do presente contrato.`;
          break;

        default:
          content = clause.content || this.getDefaultClauseContent(clause.id, type, variables);
      }

      return {
        ...clause,
        content
      };
    });
  }

  private getDefaultClauseContent(clauseId: string, type: ContractType, variables?: Record<string, string>): string {
    const defaults: Record<string, string> = {
      warranties: 'Ambas as partes se obrigam a cumprir o aqui pactuado, sob pena de rescisão e multa.',
      obligations: 'O VENDEDOR se obriga a entregar o imóvel livre de quaisquer ônus. O COMPRADOR se obriga a pagar o preço pactuado.',
      penalties: 'Em caso de inadimplência, será aplicada multa de 10% sobre o valor total do contrato.',
      termination: 'Este contrato poderá ser rescindido por qualquer das partes em caso de descumprimento das obrigações aqui assumidas.',
      maintenance: 'As despesas de conservação e pequenos reparos serão de responsabilidade do LOCATÁRIO.',
      use: 'O imóvel deverá ser utilizado exclusivamente para fins residenciais.',
      conditions: `As condições de pagamento e demais termos shall be definidos em contrato específico após aprovação desta proposta.`,
      scope: `Autorização para ${variables?.scope || 'captar, anunciar e negociar'} o imóvel acima identificado.`,
      intro: `A presente proposta comercial tem por objetivo estabelecer os termos e condições para ${variables?.purpose || 'a aquisição'} do imóvel acima descrito.`
    };

    return defaults[clauseId] || '';
  }

  generateHtml(contract: Contract): string {
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; color: #333; margin-bottom: 30px; }
        h2 { color: #555; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-top: 30px; }
        p { text-align: justify; margin: 15px 0; }
        .clause { margin-bottom: 20px; }
        .signature { margin-top: 50px; page-break-inside: avoid; }
        .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
        @media print { body { padding: 20px; } }
      </style>
    `;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        <h1>${contract.title}</h1>
        <p style="text-align: center; color: #666;">${contract.description}</p>
    `;

    contract.clauses.forEach(clause => {
      html += `
        <div class="clause">
          <h2>${clause.order}. ${clause.title}</h2>
          <p>${clause.content.replace(/\n/g, '<br>')}</p>
        </div>
      `;
    });

    html += `
        <div class="signature">
          <p style="text-align: center; margin-top: 50px;">${contract.property.city}, ${new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
          <table style="width: 100%; margin-top: 40px;">
            <tr>
              <td style="width: 50%;">
                <div class="signature-line">${contract.parties.filter(p => p.type === 'seller' || p.type === 'landlord')[0]?.name || 'VENDEDOR/LOCADOR'}</div>
              </td>
              <td style="width: 50%;">
                <div class="signature-line">${contract.parties.filter(p => p.type === 'buyer' || p.type === 'tenant')[0]?.name || 'COMPRADOR/LOCATÁRIO'}</div>
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  generatePdfHtml(contract: Contract): string {
    return this.generateHtml(contract);
  }

  exportToPdf(contract: Contract): Promise<Blob> {
    const html = this.generatePdfHtml(contract);
    return new Promise((resolve) => {
      const blob = new Blob([html], { type: 'text/html' });
      resolve(blob);
    });
  }
}

export const contractGenerator = new ContractGenerator();
