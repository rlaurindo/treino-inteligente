/**
 * MB WAY Payment Gateway - Simulated Integration Service
 * 
 * Este serviço simula a integração com um gateway de pagamentos real para MB WAY em Portugal
 * (como IfThenPay, Easypay, ou Stripe com suporte MB WAY).
 * 
 * Inclui:
 * 1. Criação de checkout de transações pendentes.
 * 2. Simulação explícita de gatilho assíncrono de notificações de Webhook (Push).
 * 3. Validação de segurança de assinaturas de Webhook recebidas.
 * 4. Processamento de payloads de sucesso e fracasso.
 */

import { Router } from "express";

export interface MBWayTransaction {
  id: string;
  phoneNumber: string;
  amount: number;
  status: "pending" | "paid" | "failed";
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
}

// Em memória - Armazenamento temporário de transações no servidor do applet
const transactionsDb = new Map<string, MBWayTransaction>();

// Chave ou Assinatura Secreta simulada para validação do Webhook (Segurança)
const WEBHOOK_SECRET_KEY = "mbway_secret_webhook_signature_auth_token";

/**
 * Cria uma nova transação simulada de MB WAY.
 */
export function createMBWayTransaction(phoneNumber: string, amount: number): MBWayTransaction {
  const transactionId = "tx_" + Math.random().toString(36).substring(2, 11).toUpperCase();
  
  const newTx: MBWayTransaction = {
    id: transactionId,
    phoneNumber,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  transactionsDb.set(transactionId, newTx);

  // --- SIMULAÇÃO DE WEBHOOK ---
  // Desabilitamos o acionador automático assíncrono para que o utilizador possa utilizar o
  // Simulador de Telemóvel interativo na direita para "ConfirmarPagamento" ou "Cancelar".
  // Isto permite uma simulação 100% realista e controlada.

  return newTx;
}

/**
 * Retorna as informações e estado atual de uma transação.
 */
export function getTransaction(id: string): MBWayTransaction | undefined {
  return transactionsDb.get(id);
}

/**
 * Valida a autenticidade e processa o payload vindo do Webhook do Gateway.
 */
export function handleWebhookNotification(signature: string | undefined, payload: any): { success: boolean; message: string; tx?: MBWayTransaction } {
  // Verificação de Segurança de Assinatura
  if (!signature || signature !== WEBHOOK_SECRET_KEY) {
    console.error(`[Webhook MB WAY] ❌ Assinatura de webhook inválida ou ausente.`);
    return { success: false, message: "Assinatura inválida (Unauthorized)" };
  }

  const { transactionId, event, failureReason } = payload;
  const tx = transactionsDb.get(transactionId);

  if (!tx) {
    console.error(`[Webhook MB WAY] ❌ Transação ${transactionId} não foi encontrada.`);
    return { success: false, message: "Transação não encontrada" };
  }

  // Prevenir reprocessamento de transações finais
  if (tx.status !== "pending") {
    console.log(`[Webhook MB WAY] ⚠️ Transação ${transactionId} já está concluída com estado: ${tx.status}`);
    return { success: true, message: "Transação já processada anteriormente", tx };
  }

  tx.updatedAt = new Date().toISOString();

  if (event === "payment.success") {
    tx.status = "paid";
    console.log(`[Webhook MB WAY] ✅ SUCESSO: O pagamento da Transação ${transactionId} de €${tx.amount.toFixed(2)} foi confirmado via Webhook.`);
  } else if (event === "payment.failed") {
    tx.status = "failed";
    tx.failureReason = failureReason || "Peticionamento rejeitado pelo cliente ou expirado.";
    console.warn(`[Webhook MB WAY] ❌ FRACASSO: O pagamento de ${transactionId} falhou via Webhook. Motivo: ${tx.failureReason}`);
  }

  transactionsDb.set(transactionId, tx);
  return { success: true, message: "Notificação processada com sucesso", tx };
}

/**
 * Auxiliar para simular as notificações assíncronas automáticas enviadas
 * pelo gateway externo para a nossa rota de webhook.
 */
function simulateAsyncWebhookTrigger(transactionId: string, phoneNumber: string) {
  const delayMs = 3500; // Tempo de espera para o usuário receber o push e aceitar

  setTimeout(() => {
    const tx = transactionsDb.get(transactionId);
    if (!tx || tx.status !== "pending") return;

    // Simular que o número terminado em '0' falha de propósito para fins de teste/depuração de erros de pagamento
    const shouldFail = phoneNumber.endsWith("0");

    const webhookPayload = {
      transactionId: transactionId,
      amount: tx.amount,
      event: shouldFail ? "payment.failed" : "payment.success",
      failureReason: shouldFail ? "Saldo insuficiente ou transação cancelada pelo usuário no telemóvel." : undefined,
      timestamp: new Date().toISOString()
    };

    console.log(`[Simulador Gateway] 📡 Despoletando Webhook assíncrono automático para a transação ${transactionId}...`);

    // Chamar diretamente a nossa lógica interna de tratamento de webhook
    // para emular a recepção de uma requisição HTTP real protegida por assinatura.
    handleWebhookNotification(WEBHOOK_SECRET_KEY, webhookPayload);

  }, delayMs);
}
