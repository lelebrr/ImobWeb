import { Html, Head, Preview, Body, Container, Section, Text, Heading, Button, Hr, Img, Row, Column } from '@react-email/components';
import * as React from 'react';

interface WeeklyReportEmailProps {
  agentName: string;
  period: string;
  totalLeads: number;
  newLeads: number;
  totalVisits: number;
  scheduledVisits: number;
  dealsClosed: number;
  dealsValue: number;
  pipelineValue: number;
  topProperties?: Array<{ address: string; views: number; leads: number }>;
  topPortal?: { name: string; leads: number };
  insights?: string[];
  ctaUrl?: string;
}

export const WeeklyReportEmail: React.FC<WeeklyReportEmailProps> = ({
  agentName,
  period,
  totalLeads,
  newLeads,
  totalVisits,
  scheduledVisits,
  dealsClosed,
  dealsValue,
  pipelineValue,
  topProperties,
  topPortal,
  insights = [],
  ctaUrl = 'https://app.imobweb.com.br/dashboard'
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Html>
      <Head />
      <Preview>Seu relatório semanal - imobWeb</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={headerSection}>
            <Row>
              <Column>
                <Heading style={logoText}>imobWeb</Heading>
              </Column>
              <Column align="right">
                <Text style={dateText}>{period}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={introSection}>
            <Heading style={heading}>Olá, {agentName}!</Heading>
            <Text style={introText}>
              Aqui está o resumo da sua semana no imobWeb. Continue assim, você está mandando muito bem!
            </Text>
          </Section>

          <Section style={statsSection}>
            <Row>
              <Column style={statCard}>
                <Text style={statLabel}>Novos Leads</Text>
                <Text style={statValue}>{newLeads}</Text>
                <Text style={statSubtext}>+{totalLeads} total</Text>
              </Column>
              <Column style={statCard}>
                <Text style={statLabel}>Visitas</Text>
                <Text style={statValue}>{totalVisits}</Text>
                <Text style={statSubtext}>{scheduledVisits} agendadas</Text>
              </Column>
              <Column style={statCard}>
                <Text style={statLabel}>Negócios Fechados</Text>
                <Text style={statValueHighlight}>{dealsClosed}</Text>
                <Text style={statSubtext}>{formatCurrency(dealsValue)}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={pipelineSection}>
            <div style={highlightBox}>
              <Text style={highlightLabel}>Valor do Pipeline</Text>
              <Text style={highlightValue}>{formatCurrency(pipelineValue)}</Text>
              <Text style={highlightSubtext}>Em negociação ativa</Text>
            </div>
          </Section>

          {topProperties && topProperties.length > 0 && (
            <Section style={section}>
              <Heading style={sectionTitle}>🏠 Imóveis Mais Visualizados</Heading>
              {topProperties.map((property, index) => (
                <div key={index} style={propertyCard}>
                  <Text style={propertyAddress}>{property.address}</Text>
                  <Row>
                    <Column>
                      <Text style={propertyMetric}>{property.views} visualizações</Text>
                    </Column>
                    <Column align="right">
                      <Text style={propertyMetric}>{property.leads} leads</Text>
                    </Column>
                  </Row>
                </div>
              ))}
            </Section>
          )}

          {topPortal && (
            <Section style={section}>
              <Heading style={sectionTitle}>Portal Mais Eficiente</Heading>
              <div style={portalCard}>
                <Text style={portalName}>{topPortal.name}</Text>
                <Text style={portalMetric}>{topPortal.leads} leads gerados</Text>
              </div>
            </Section>
          )}

          {insights && insights.length > 0 && (
            <Section style={section}>
              <Heading style={sectionTitle}>Insights da Semana</Heading>
              {insights.map((insight, index) => (
                <Text key={index} style={insightText}>• {insight}</Text>
              ))}
            </Section>
          )}

          <Section style={ctaSection}>
            <Button style={ctaButton} href={ctaUrl}>
              Ver Dashboard Completo
            </Button>
          </Section>

          <Hr style={divider} />

          <Section style={footer}>
            <Text style={footerText}>
              Este relatório foi enviado automaticamente pelo imobWeb. Para ajustar suas preferências de notificação,{' '}
              <a href="#" style={linkStyle}>clique aqui</a>.
            </Text>
            <Text style={footerSubtext}>
              © 2026 imobWeb. Todos os direitos reservados.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const body: React.CSSProperties = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container: React.CSSProperties = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: 600,
};

const headerSection: React.CSSProperties = {
  marginBottom: 24,
};

const logoText: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 700,
  color: '#2563eb',
  margin: 0,
};

const dateText: React.CSSProperties = {
  fontSize: 14,
  color: '#64748b',
  margin: 0,
};

const introSection: React.CSSProperties = {
  marginBottom: 32,
};

const heading: React.CSSProperties = {
  fontSize: 24,
  fontWeight: 600,
  color: '#1e293b',
  marginBottom: 8,
};

const introText: React.CSSProperties = {
  fontSize: 16,
  color: '#475569',
  lineHeight: 1.5,
  margin: 0,
};

const statsSection: React.CSSProperties = {
  marginBottom: 24,
};

const statCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: 16,
  textAlign: 'center' as const,
  border: '1px solid #e2e8f0',
  width: '32%',
};

const statLabel: React.CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  margin: 0,
  textTransform: 'uppercase' as const,
  fontWeight: 500,
};

const statValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#1e293b',
  margin: '8px 0',
};

const statValueHighlight: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#16a34a',
  margin: '8px 0',
};

const statSubtext: React.CSSProperties = {
  fontSize: 12,
  color: '#94a3b8',
  margin: 0,
};

const pipelineSection: React.CSSProperties = {
  marginBottom: 24,
};

const highlightBox: React.CSSProperties = {
  backgroundColor: '#eff6ff',
  borderRadius: 12,
  padding: 24,
  textAlign: 'center' as const,
  border: '1px solid #bfdbfe',
};

const highlightLabel: React.CSSProperties = {
  fontSize: 14,
  color: '#3b82f6',
  margin: 0,
  fontWeight: 500,
};

const highlightValue: React.CSSProperties = {
  fontSize: 36,
  fontWeight: 700,
  color: '#1e40af',
  margin: '8px 0',
};

const highlightSubtext: React.CSSProperties = {
  fontSize: 14,
  color: '#60a5fa',
  margin: 0,
};

const section: React.CSSProperties = {
  marginBottom: 24,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: '#1e293b',
  marginBottom: 12,
};

const propertyCard: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 8,
  padding: 12,
  marginBottom: 8,
  border: '1px solid #e2e8f0',
};

const propertyAddress: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: '#1e293b',
  margin: '0 0 8px 0',
};

const propertyMetric: React.CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  margin: 0,
};

const portalCard: React.CSSProperties = {
  backgroundColor: '#f0fdf4',
  borderRadius: 8,
  padding: 16,
  border: '1px solid #bbf7d0',
};

const portalName: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 600,
  color: '#166534',
  margin: 0,
};

const portalMetric: React.CSSProperties = {
  fontSize: 14,
  color: '#22c55e',
  margin: '4px 0 0 0',
};

const insightText: React.CSSProperties = {
  fontSize: 14,
  color: '#475569',
  margin: '0 0 8px 0',
  lineHeight: 1.5,
};

const ctaSection: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: 24,
};

const ctaButton: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  textDecoration: 'none',
  display: 'inline-block',
};

const divider: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '24px 0',
};

const footer: React.CSSProperties = {
  textAlign: 'center' as const,
};

const footerText: React.CSSProperties = {
  fontSize: 12,
  color: '#64748b',
  margin: 0,
  lineHeight: 1.5,
};

const footerSubtext: React.CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  margin: '8px 0 0 0',
};

const linkStyle: React.CSSProperties = {
  color: '#2563eb',
  textDecoration: 'underline',
};

export default WeeklyReportEmail;
