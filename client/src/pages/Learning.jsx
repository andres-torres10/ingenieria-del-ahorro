import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

const TOPICS = [
  {
    icon: '💡',
    title: '¿Qué es el interés simple?',
    summary: 'Aprende cómo se calcula el costo real de un préstamo.',
    content: `El interés simple se calcula sobre el capital inicial sin acumular intereses previos.

Fórmula: I = C × r × t

Donde:
• C = Capital inicial
• r = Tasa de interés (en decimal)
• t = Tiempo (en años o meses)

Ejemplo: Si pides $1.000.000 al 2% mensual por 12 meses:
I = 1.000.000 × 0.02 × 12 = $240.000

El monto total a pagar sería $1.240.000.

A diferencia del interés compuesto, el interés simple no se acumula sobre los intereses ya generados, por lo que es más fácil de calcular y generalmente más favorable para el deudor.`,
  },
  {
    icon: '🐜',
    title: 'Gastos hormiga: el enemigo silencioso',
    summary: 'Pequeños gastos diarios que destruyen tu presupuesto sin que te des cuenta.',
    content: `Los gastos hormiga son pequeños desembolsos frecuentes que parecen insignificantes pero que sumados representan una cantidad enorme al año.

Ejemplos comunes:
• Café diario: $3.000 × 22 días = $66.000/mes = $792.000/año
• Domicilios: $15.000 × 8 veces = $120.000/mes = $1.440.000/año
• Streaming múltiple: $50.000/mes = $600.000/año

Estrategia para eliminarlos:
1. Registra TODOS tus gastos durante 30 días
2. Identifica los que puedes eliminar o reducir
3. Reemplaza hábitos costosos por alternativas económicas
4. Redirige ese dinero al ahorro

Recuerda: No se trata de no disfrutar la vida, sino de ser consciente de en qué gastas tu dinero.`,
  },
  {
    icon: '💰',
    title: 'Cómo ahorrar el 10% de tus ingresos',
    summary: 'La regla del 10% que puede cambiar tu vida financiera.',
    content: `La regla del 10% es simple: ahorra al menos el 10% de cada ingreso que recibas, sin excusas.

¿Cómo lograrlo?

1. Págate primero a ti mismo
   Apenas recibas tu salario, transfiere el 10% a una cuenta de ahorros separada antes de pagar cualquier gasto.

2. Automatiza el ahorro
   Configura una transferencia automática el día que recibes tu pago.

3. Reduce gastos hormiga
   Identifica y elimina gastos innecesarios para liberar ese 10%.

4. Aumenta tus ingresos
   Busca fuentes adicionales de ingreso: freelance, ventas, etc.

Proyección del 10% de $3.000.000/mes:
• 6 meses: $1.800.000
• 1 año: $3.600.000
• 3 años: $10.800.000

El tiempo y la constancia son tus mejores aliados.`,
  },
  {
    icon: '🏦',
    title: 'Cómo salir de deudas',
    summary: 'Estrategias probadas para liberarte de las deudas más rápido.',
    content: `Existen dos estrategias principales para pagar deudas:

🎯 Método Avalancha (más eficiente matemáticamente)
1. Lista todas tus deudas de mayor a menor tasa de interés
2. Paga el mínimo en todas
3. Destina todo el dinero extra a la deuda con mayor tasa
4. Cuando la pagas, pasa al siguiente

❄️ Método Bola de Nieve (más motivador)
1. Lista tus deudas de menor a mayor saldo
2. Paga el mínimo en todas
3. Destina todo el dinero extra a la deuda más pequeña
4. Cuando la pagas, usa ese dinero para la siguiente

Consejos adicionales:
• Negocia tasas más bajas con tu banco
• Consolida deudas si es posible
• Evita adquirir nuevas deudas mientras pagas las actuales
• Considera un segundo ingreso temporal

Recuerda: cada peso extra que destines a tus deudas te ahorra intereses futuros.`,
  },
];

const VIDEOS = [
  {
    title: 'Cómo hacer un presupuesto personal',
    description: 'Aprende a organizar tus finanzas con un presupuesto mensual efectivo.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    title: 'El poder del ahorro compuesto',
    description: 'Descubre cómo el interés compuesto puede multiplicar tus ahorros con el tiempo.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    title: 'Cómo salir de deudas en Colombia',
    description: 'Estrategias prácticas adaptadas a la realidad financiera colombiana.',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
];

const TIP_SHEETS = [
  {
    title: '📋 Plantilla de presupuesto mensual',
    content: `PLANTILLA DE PRESUPUESTO MENSUAL
================================

INGRESOS
--------
Salario principal:          $___________
Ingresos adicionales:       $___________
TOTAL INGRESOS:             $___________

GASTOS FIJOS (50-60% del ingreso)
----------------------------------
Arriendo/hipoteca:          $___________
Servicios públicos:         $___________
Transporte:                 $___________
Alimentación básica:        $___________
Salud/seguros:              $___________
TOTAL GASTOS FIJOS:         $___________

GASTOS VARIABLES (20-30%)
--------------------------
Entretenimiento:            $___________
Ropa:                       $___________
Gastos hormiga:             $___________
TOTAL VARIABLES:            $___________

AHORRO Y DEUDAS (20%)
----------------------
Ahorro (mínimo 10%):        $___________
Pago deudas:                $___________
Fondo emergencias:          $___________
TOTAL AHORRO/DEUDAS:        $___________

BALANCE: Ingresos - Gastos = $___________

Regla 50/30/20:
• 50% necesidades básicas
• 30% deseos y entretenimiento  
• 20% ahorro e inversión`,
  },
  {
    title: '🎯 10 hábitos financieros exitosos',
    content: `10 HÁBITOS FINANCIEROS EXITOSOS
================================

1. PÁGATE PRIMERO
   Ahorra el 10% antes de gastar en cualquier otra cosa.

2. LLEVA UN REGISTRO
   Anota cada peso que gastas. Lo que no se mide, no se controla.

3. VIVE POR DEBAJO DE TUS POSIBILIDADES
   Gasta menos de lo que ganas, siempre.

4. ELIMINA DEUDAS DE CONSUMO
   Las tarjetas de crédito y créditos de consumo son el mayor obstáculo.

5. CREA UN FONDO DE EMERGENCIAS
   Ahorra 3-6 meses de gastos para imprevistos.

6. INVIERTE EN TI MISMO
   Educación y habilidades son la mejor inversión.

7. DIVERSIFICA TUS INGRESOS
   No dependas de una sola fuente de dinero.

8. PLANIFICA TUS COMPRAS GRANDES
   Ahorra para lo que quieres en lugar de endeudarte.

9. REVISA TUS FINANZAS MENSUALMENTE
   Ajusta tu presupuesto según los resultados.

10. PIENSA A LARGO PLAZO
    Las decisiones de hoy determinan tu libertad financiera futura.

"No es cuánto ganas, sino cuánto guardas." - Robert Kiyosaki`,
  },
];

export default function Learning() {
  const [expanded, setExpanded] = useState(null);
  const [tipModal, setTipModal] = useState(null);

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">🎓 Aprende</h1>

      {/* Topic cards */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Temas de educación financiera</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TOPICS.map((t, i) => (
            <Card key={i} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 items-start">
                  <span className="text-3xl">{t.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{t.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t.summary}</p>
                  </div>
                </div>
                <span className="text-gray-400 text-lg shrink-0">{expanded === i ? '▲' : '▼'}</span>
              </div>
              {expanded === i && (
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                  {t.content}
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Videos */}
      <section className="mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">Videos educativos</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {VIDEOS.map((v, i) => (
            <Card key={i}>
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
                <iframe
                  src={v.url}
                  title={v.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm">{v.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{v.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Tip sheets */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-4">Hojas de consejos descargables</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TIP_SHEETS.map((s, i) => (
            <Card key={i} className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-800">{s.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Haz clic para ver el contenido</p>
              </div>
              <Button variant="outline" onClick={() => setTipModal(s)}>Ver</Button>
            </Card>
          ))}
        </div>
      </section>

      <Modal open={!!tipModal} onClose={() => setTipModal(null)} title={tipModal?.title}>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{tipModal?.content}</pre>
        <div className="mt-4">
          <Button onClick={() => {
            const blob = new Blob([tipModal.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url;
            a.download = `${tipModal.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
            a.click(); URL.revokeObjectURL(url);
          }}>Descargar</Button>
        </div>
      </Modal>
    </div>
  );
}
