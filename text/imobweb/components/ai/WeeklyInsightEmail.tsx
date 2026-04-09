import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  render,
} from '@react-email/components';
import * as React from 'react';

interface WeeklyInsightEmailProps {
  agencyName: string;
  highRiskPropertiesCount: number;
  marketInsights: string[];
}

/**
 * Template de E-mail de Insights Semanais.
 * Design limpo e focado em conversão e retenção.
 */
export const WeeklyInsightEmail = ({
  agencyName,
  highRiskPropertiesCount,
  marketInsights,
}: WeeklyInsightEmailProps) => (
  <Html>
    <Head />
    <Preview>Relatório Semanal de Insights imobWeb para {agencyName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Insights Inteligentes</Heading>
          <Text style={sub}>Análise de Dados {new Date().toLocaleDateString('pt-BR')}</Text>
        </Section>
        
        <Section style={alertSection}>
          <Text style={alertHeading}>Atenção: Ação Necessária</Text>
          <Text style={alertText}>
            Detectamos <strong>{highRiskPropertiesCount} imóveis</strong> na sua carteira com alto risco de serem retirados pelos proprietários por falta de engajamento ou preço desalinhado.
          </Text>
          <Link href="https://app.imobweb.com.br/insights" style={button}>
            Ver Imóveis em Risco
          </Link>
        </Section>

        <Section style={content}>
          <Heading style={h2}>Destaques do Mercado</Heading>
          {marketInsights.map((insight, index) => (
            <Text key={index} style={listItem}>
              • {insight}
            </Text>
          ))}
        </Section>

        <Hr style={hr} />
        
        <Section style={footer}>
          <Text style={footerText}>
            Gerado automaticamente pela Camada de IA Preditiva imobWeb.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px',
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const sub = {
  color: '#e0e7ff',
  fontSize: '14px',
  margin: '10px 0 0',
};

const alertSection = {
  padding: '32px',
  backgroundColor: '#fff7ed',
  borderLeft: '4px solid #f97316',
};

const alertHeading = {
  color: '#9a3412',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px',
};

const alertText = {
  color: '#c2410c',
  fontSize: '14px',
  lineHeight: '24px',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px 0',
  marginTop: '20px',
};

const h2 = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#1e293b',
};

const content = {
  padding: '32px',
};

const listItem = {
  fontSize: '14px',
  color: '#475569',
  lineHeight: '22px',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '20px 0',
};

const footer = {
  padding: '0 32px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
};
