import mailchimp from '@mailchimp/mailchimp_marketing';
import transactional from '@mailchimp/mailchimp_transactional';

// Configuração do Cliente de Marketing
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_MARKETING_API_KEY,
  server: process.env.MAILCHIMP_MARKETING_SERVER_PREFIX, // ex: 'us1'
});

// Configuração do Cliente Transacional (Mandrill)
const mandrill = transactional(process.env.MAILCHIMP_TRANSACTIONAL_API_KEY || '');

export { mailchimp, mandrill };
