-- Seed data for plano_contas, premissas, and first admin
-- Generated for Phase 3 (Foundation). Per D-08: column names use renamed forms
-- (plano_contas.categoria, prestadores.comissao_pct).

INSERT INTO plano_contas (cod, nome, tipo, categoria) VALUES
  ('1.1', 'Sessão individual', 'receita', 'Atendimento'),
  ('1.2', 'Sessão em grupo', 'receita', 'Atendimento'),
  ('1.3', 'Avaliação diagnóstica', 'receita', 'Atendimento'),
  ('1.4', 'Programa intensivo', 'receita', 'Atendimento'),
  ('1.9', 'Outras receitas', 'receita', 'Outros'),
  ('2.1', 'Aluguel', 'despesa', 'Ocupação'),
  ('2.2', 'Pró-labore', 'despesa', 'Pessoal'),
  ('2.3', 'Comissões prestadores', 'despesa', 'Pessoal'),
  ('2.4', 'Impostos e tributos', 'despesa', 'Fiscal'),
  ('2.5', 'Material clínico', 'despesa', 'Operacional'),
  ('2.6', 'Taxas bancárias/cartão', 'despesa', 'Financeiro'),
  ('2.7', 'Tecnologia e sistemas', 'despesa', 'Tecnologia'),
  ('2.8', 'Marketing', 'despesa', 'Marketing'),
  ('2.9', 'Outros custos', 'despesa', 'Outros')
ON CONFLICT DO NOTHING;

INSERT INTO premissas (chave, valor) VALUES
  ('imposto', 11.33),
  ('pix', 0),
  ('dinheiro', 0),
  ('transferencia', 0),
  ('debito', 1.5),
  ('credito_vista', 2.5),
  ('credito_par', 3.5),
  ('boleto', 0)
ON CONFLICT (chave) DO NOTHING;

INSERT INTO usuarios_permitidos (email, nome, role, ativo)
VALUES ('marcelo.mattioli@pruma.io', 'Marcelo Mattioli', 'admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'admin', ativo = true;
