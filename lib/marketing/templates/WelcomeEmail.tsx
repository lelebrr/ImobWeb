import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

/**
 * Welcome Email Template for imobWeb
 * Premium design using React Email components.
 */

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export const WelcomeEmail = ({
  userName = "Parceiro",
  loginUrl = "https://imobweb.com/login",
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Seja bem-vindo ao futuro do mercado imobiliário!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://imobweb.com/logo-email.png"
            width="170"
            height="50"
            alt="imobWeb"
          />
        </Section>
        <Section style={contentSection}>
          <Heading style={h1}>Olá, {userName}!</Heading>
          <Text style={text}>
            Estamos empolgados em ter você no **imobWeb**, o CRM imobiliário mais avançado do mercado.
          </Text>
          <Text style={text}>
            Sua conta já está pronta. Clique no botão abaixo para acessar seu dashboard e começar a escalar suas vendas com IA.
          </Text>
          <Section style={btnContainer}>
            <Link href={loginUrl} style={button}>
              Acessar minha conta
            </Link>
          </Section>
          <Text style={text}>
            Se precisar de qualquer ajuda, nossa equipe de suporte está à disposição.
          </Text>
        </Section>
        <Section style={footer}>
          <Text style={footerText}>
            © 2026 imobWeb CRM. Todos os direitos reservados.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

// --- Estilos ---
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const logoSection = {
  padding: "40px",
  textAlign: "center" as const,
};

const contentSection = {
  padding: "0 48px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "26px",
  textAlign: "left" as const,
};

const btnContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#000",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const footer = {
  padding: "0 48px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "24px",
  textAlign: "center" as const,
  marginTop: "12px",
};
