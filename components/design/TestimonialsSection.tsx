import React from 'react';
import { Star, Quote, TrendingUp, Clock, ShieldCheck } from 'lucide-react';

const testimonials = [
    {
        name: "Carlos Méndez",
        role: "Dueño, Refritécnica del Valle",
        location: "Cali, Colombia",
        image: "RM",
        quote: "Antes perdía el 20% de los repuestos y mis técnicos daban vueltas en la camioneta gastando gasolina. Con el módulo de rutas y el control de inventario, reduje gastos y ahora atiendo 5 servicios más al día.",
        stat: "+35% Facturación",
        statIcon: TrendingUp,
        colorClass: "text-[#39ff14]",
        bgClass: "bg-[#39ff14]",
        borderClass: "hover:border-[#39ff14]",
        gradientClass: "from-[#39ff14]/20"
    },
    {
        name: "Ing. Sofia Lagos",
        role: "Gerente, FixIt Laptops",
        location: "CDMX, México",
        image: "FL",
        quote: "El caos de papeles era insoportable. Los clientes llamaban todo el día preguntando '¿ya está listo?'. Ahora el Bot de WhatsApp les avisa solo. Mi equipo trabaja tranquilo y el taller se ve ultra profesional.",
        stat: "-2 Horas/Día en Teléfono",
        statIcon: Clock,
        colorClass: "text-[#00f3ff]",
        bgClass: "bg-[#00f3ff]",
        borderClass: "hover:border-[#00f3ff]",
        gradientClass: "from-[#00f3ff]/20"
    },
    {
        name: "Javier Torres",
        role: "Fundador, ElectroServicio Torres",
        location: "Lima, Perú",
        image: "ET",
        quote: "Lo que más me gusta es la 'Evidencia Digital'. Antes el cliente decía 'así no venía mi lavadora'. Ahora con las fotos del ingreso firmadas en la tablet, se acabaron los reclamos injustos. Duermo tranquilo.",
        stat: "0 Reclamos Injustos",
        statIcon: ShieldCheck,
        colorClass: "text-[#bc13fe]",
        bgClass: "bg-[#bc13fe]",
        borderClass: "hover:border-[#bc13fe]",
        gradientClass: "from-[#bc13fe]/20"
    }
];

const TestimonialsSection: React.FC = () => {
    return (
        <section className="py-20 px-6 relative z-10 border-t border-white/5 bg-black/40">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                        TALLERES QUE YA <span className="text-[#00e5ff]">EVOLUCIONARON</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto font-medium">
                        No confíes en nuestra palabra. Mira lo que colegas del gremio en Latinoamérica han logrado digitalizando sus operaciones.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div
                            key={idx}
                            className={`
                bg-black/40 backdrop-blur-xl p-8 rounded-2xl relative group hover:-translate-y-2 transition-transform duration-300
                border-t border-white/10 ${t.borderClass}
              `}
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-8 opacity-20">
                                <Quote size={40} className={t.colorClass} />
                            </div>

                            {/* Header Profile */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-black text-black
                  ${t.bgClass} shadow-[0_0_15px_rgba(255,255,255,0.3)]
                `}>
                                    {t.image}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white font-mono leading-tight uppercase font-black">{t.name}</h4>
                                    <p className="text-xs text-gray-400 font-medium">{t.role}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-black">{t.location}</p>
                                </div>
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-300 text-sm leading-relaxed mb-8 italic relative z-10 font-medium">
                                "{t.quote}"
                            </p>

                            {/* Stat Badge */}
                            <div className={`
                absolute bottom-0 left-0 right-0 h-14 
                bg-gradient-to-t ${t.gradientClass} to-transparent 
                flex items-center px-8 rounded-b-2xl
              `}>
                                <div className="flex items-center gap-2 text-white font-mono text-xs font-black uppercase">
                                    <t.statIcon size={16} className={t.colorClass} />
                                    <span>RESULTADO: <span className={t.colorClass}>{t.stat}</span></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Trust Indicators */}
                <div className="mt-20 flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="text-xl font-black font-mono tracking-tighter text-white uppercase italic">SAMSUNG <span className="text-xs font-normal align-top not-italic">PARTNER</span></div>
                    <div className="text-xl font-black font-mono tracking-tighter text-white uppercase italic">LG <span className="text-xs font-normal align-top not-italic">AUTHORIZED</span></div>
                    <div className="text-xl font-black font-mono tracking-tighter text-white uppercase italic">WHIRLPOOL <span className="text-xs font-normal align-top not-italic">SERVICE</span></div>
                    <div className="text-xl font-black font-mono tracking-tighter text-white uppercase italic">MABE <span className="text-xs font-normal align-top not-italic">TECH</span></div>
                </div>

            </div>
        </section>
    );
};

export default TestimonialsSection;
