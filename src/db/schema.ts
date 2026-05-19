import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  date,
  timestamp,
  index,
  check,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// =====================================================
// 1. USUÁRIOS PERMITIDOS (controle de acesso)
// =====================================================
export const usuariosPermitidos = pgTable(
  'usuarios_permitidos',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    email:     text('email').unique().notNull(),
    nome:      text('nome').notNull(),
    role:      text('role').notNull().default('operacional'),
    ativo:     boolean('ativo').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    checkRole: check('usuarios_permitidos_role_check', sql`${table.role} IN ('admin','operacional')`),
  }),
)

export type UsuarioPermitido    = typeof usuariosPermitidos.$inferSelect
export type NewUsuarioPermitido = typeof usuariosPermitidos.$inferInsert

// =====================================================
// 2. CLIENTES (pacientes)
// =====================================================
export const clientes = pgTable('clientes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  nome:        text('nome').notNull(),
  responsavel: text('responsavel'),
  telefone:    text('telefone'),
  email:       text('email'),
  // D-08: obs → observacao
  observacao:  text('observacao'),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export type Cliente    = typeof clientes.$inferSelect
export type NewCliente = typeof clientes.$inferInsert

// =====================================================
// 3. PRESTADORES (psicólogos e ATs)
// =====================================================
export const prestadores = pgTable(
  'prestadores',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    nome:       text('nome').notNull(),
    tipo:       text('tipo').notNull(),
    // D-08: com → comissao_pct
    comissaoPct: numeric('comissao_pct').notNull().default('0'),
    // D-08: obs → observacao
    observacao: text('observacao'),
    ativo:      boolean('ativo').notNull().default(true),
    createdAt:  timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    checkTipo: check('prestadores_tipo_check', sql`${table.tipo} IN ('psicologo','at')`),
  }),
)

export type Prestador    = typeof prestadores.$inferSelect
export type NewPrestador = typeof prestadores.$inferInsert

// =====================================================
// 4. PLANO DE CONTAS
// =====================================================
export const planoContas = pgTable(
  'plano_contas',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    cod:       text('cod').notNull(),
    nome:      text('nome').notNull(),
    tipo:      text('tipo').notNull(),
    // D-08: cat → categoria
    categoria: text('categoria'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    checkTipo: check('plano_contas_tipo_check', sql`${table.tipo} IN ('receita','despesa')`),
  }),
)

export type PlanoContas    = typeof planoContas.$inferSelect
export type NewPlanoContas = typeof planoContas.$inferInsert

// =====================================================
// 5. PREMISSAS GLOBAIS
// =====================================================
export const premissas = pgTable('premissas', {
  chave:     text('chave').primaryKey(),
  valor:     numeric('valor').notNull().default('0'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
})

export type Premissa    = typeof premissas.$inferSelect
export type NewPremissa = typeof premissas.$inferInsert

// =====================================================
// 6. LANÇAMENTOS
// =====================================================
export const lancamentos = pgTable(
  'lancamentos',
  {
    id:             uuid('id').primaryKey().defaultRandom(),
    tipo:           text('tipo').notNull(),
    descricao:      text('descricao').notNull(),
    valor:          numeric('valor').notNull(),
    data:           date('data').notNull(),
    dataCompetencia: date('data_competencia'),
    dataVencimento:  date('data_vencimento'),
    dataPagamento:   date('data_pagamento'),
    contaId:         uuid('conta_id').references(() => planoContas.id),
    clienteId:       uuid('cliente_id').references(() => clientes.id),
    prestadorId:     uuid('prestador_id').references(() => prestadores.id),
    formaPagamento:  text('forma_pagamento'),
    status:          text('status').notNull().default('pendente'),
    horas:           numeric('horas').default('0'),
    // D-08: obs → observacao
    observacao:      text('observacao'),
    autoComissao:    boolean('auto_comissao').notNull().default(false),
    // Self-reference with onDelete cascade (D-08 placeholder for circular FK)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    refLancId:       uuid('ref_lanc_id').references((): any => lancamentos.id, { onDelete: 'cascade' }),
    // D-08: sexta → data_pagamento_sexta
    dataPagamentoSexta: date('data_pagamento_sexta'),
    conciliado:      boolean('conciliado').notNull().default(false),
    createdBy:       text('created_by'),
    createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    checkTipo:   check('lancamentos_tipo_check', sql`${table.tipo} IN ('receita','despesa')`),
    checkStatus: check('lancamentos_status_check', sql`${table.status} IN ('pendente','recebido','pago','cancelado','projecao')`),
    idxData:      index('idx_lancamentos_data').on(table.data),
    idxTipo:      index('idx_lancamentos_tipo').on(table.tipo),
    idxStatus:    index('idx_lancamentos_status').on(table.status),
    idxPrestador: index('idx_lancamentos_prestador').on(table.prestadorId),
    idxRef:       index('idx_lancamentos_ref').on(table.refLancId),
    idxSexta:     index('idx_lancamentos_sexta').on(table.dataPagamentoSexta),
  }),
)

export type Lancamento    = typeof lancamentos.$inferSelect
export type NewLancamento = typeof lancamentos.$inferInsert

// =====================================================
// 7. AUDIT LOG
// =====================================================
export const auditLog = pgTable(
  'audit_log',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    userEmail: text('user_email').notNull(),
    userNome:  text('user_nome'),
    acao:      text('acao').notNull(),
    entidade:  text('entidade').notNull(),
    detalhes:  text('detalhes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    idxCreated: index('idx_audit_created').on(table.createdAt),
  }),
)

export type AuditLog    = typeof auditLog.$inferSelect
export type NewAuditLog = typeof auditLog.$inferInsert
