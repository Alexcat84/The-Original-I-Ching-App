-- DEMO ONLY — NEVER MERGE (PLAN-SEC-02 Ticket 4 verification: "the gate bites").
-- Deliberately breaks cross-user isolation on consultations: any authenticated
-- user can read every row. The rls-test job MUST go red on this PR.
CREATE POLICY demo_leak ON public.consultations
  FOR SELECT TO authenticated USING (true);
