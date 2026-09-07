import Reveal from '@/components/Reveal';

const BLOQUES = [
  {
    t: '1. KAEL es intermediario, no arrendador',
    p: 'KAEL actúa como mero intermediario (comisión mercantil, art. 244 y ss. del Código de Comercio). El contrato de alquiler se celebra siempre entre el cliente y la empresa náutica, que es la única responsable de la embarcación, seguros, habilitaciones y cumplimiento normativo. KAEL no cobra cantidad alguna al cliente.',
  },
  {
    t: '2. La señal la cobra la empresa',
    p: 'Para confirmar una reserva, la empresa náutica solicita al cliente una señal (habitualmente entre el 20 % y el 30 % del importe) que el cliente paga directamente a la empresa. El resto se abona según las condiciones de cada empresa. KAEL no retiene ni gestiona fondos de clientes, por lo que no actúa como entidad de pago.',
  },
  {
    t: '3. La comisión la paga la empresa',
    p: 'Por cada reserva confirmada, KAEL factura a la empresa náutica la comisión pactada por contrato (habitualmente entre el 10 % y el 20 % del importe de la reserva). Es una operación entre empresas (B2B): en España lleva el 21 % de IVA; con empresas de la UE se aplica la inversión del sujeto pasivo; y fuera de la UE se considera no sujeta como exportación de servicios.',
  },
  {
    t: '4. Cancelaciones',
    p: 'Si una reserva confirmada se cancela, el día vuelve a quedar disponible y la comisión asociada queda anulada. Las condiciones de devolución de la señal al cliente corresponden a la empresa náutica según su propio contrato.',
  },
  {
    t: '5. Protección de datos',
    p: 'Los datos del cliente que envía una solicitud se ceden únicamente a la empresa náutica destinataria para gestionar la reserva (RGPD y LOPDGDD). KAEL actúa como responsable del tratamiento de la solicitud y la empresa como destinatario encargado de la prestación.',
  },
];

export default function Legal() {
  return (
    <main className="pt-32 sm:pt-40 pb-24" data-testid="legal-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-8">
        <Reveal>
          <div className="text-[11px] uppercase tracking-[.25em] font-bold text-[#366A8B]">Modelo y aviso legal</div>
          <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">Cómo funciona el modelo de KAEL</h1>
          <p className="mt-5 text-base text-[#4B6170] leading-relaxed">
            Resumen del modelo de intermediación y comisiones. Texto orientativo: antes de operar con empresas reales,
            formaliza un contrato de comisión mercantil con cada empresa y revísalo con tu gestor o asesor legal.
          </p>
        </Reveal>
        <div className="mt-12 flex flex-col gap-8">
          {BLOQUES.map((b) => (
            <Reveal key={b.t}>
              <div className="rounded-[24px] bg-white shadow-[0_2px_24px_rgba(28,45,55,.07)] p-7">
                <h2 className="font-display text-xl">{b.t}</h2>
                <p className="mt-3 text-sm text-[#4B6170] leading-relaxed">{b.p}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  );
}
