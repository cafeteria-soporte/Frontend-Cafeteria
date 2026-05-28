import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from "recharts";

// ══════════════════════════════════════════════════════════════════════════════
//  TOGGLE DE DEMO — cambia a false para ver pantalla "sin turno activo"
//  En prod: SELECT * FROM shift_records WHERE status = 'open' LIMIT 1
// ══════════════════════════════════════════════════════════════════════════════
const TURNO_ABIERTO = true;

const TURNO_ACTUAL = TURNO_ABIERTO ? {
  shift_record_id: 14,
  cajero: "Carlos Mamani",
  initial_fund: 500,
  opened_at: "2026-05-27T12:00:00",
  horas: 3.5,
  pagos_efectivo_consecutivos: 50,
} : null;

// ══════════════════════════════════════════════════════════════════════════════
//  MOCK DATA — cada bloque tiene el SQL que lo genera en producción
// ══════════════════════════════════════════════════════════════════════════════

// ── HEATMAP: ventas por hora × día de la semana ───────────────────────────────
// SELECT EXTRACT(dow FROM uo.created_at) as dia,
//        EXTRACT(hour FROM uo.created_at) as hora,
//        SUM(oi.subtotal) as ventas
// FROM user_orders uo JOIN order_items oi USING(user_order_id)
// WHERE uo.status='paid' AND uo.created_at >= NOW() - INTERVAL '7 days'
// GROUP BY 1,2 ORDER BY 1,2
const DIAS  = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const HORAS = ["07","08","09","10","11","12","13","14","15","16","17","18"];
const heatmapData = DIAS.map((dia, di) =>
  HORAS.map((hora, hi) => {
    const esPico = (hi>=2&&hi<=4)||(hi>=5&&hi<=7);
    const esMuerta = hi<=1 || hi>=9;
    const esFinSemana = di>=4;
    const base = esMuerta ? 100 : esPico ? 1800 : 700;
    const v = Math.round(base * (1 + (esFinSemana?0.3:0)) * (0.8 + Math.random()*0.4));
    return { dia, hora, ventas: v };
  })
);

// ── VENTAS POR HORA (hoy) ─────────────────────────────────────────────────────
// SELECT date_trunc('hour', created_at) as hora, SUM(total)
// FROM user_orders WHERE status='paid' AND created_at::date = CURRENT_DATE
// GROUP BY 1 ORDER BY 1
const ventasPorHora = [
  {hora:"07h",ventas:320},{hora:"08h",ventas:890},{hora:"09h",ventas:1240},
  {hora:"10h",ventas:1580},{hora:"11h",ventas:980},{hora:"12h",ventas:2100},
  {hora:"13h",ventas:2450},{hora:"14h",ventas:1870},{hora:"15h",ventas:640},
  {hora:"16h",ventas:480},{hora:"17h",ventas:920},{hora:"18h",ventas:1100},
];

// ── STOCK CRÍTICO — TEA + Riesgo de Quiebre ──────────────────────────────────
// TEA = (current_stock - min_stock) / (ventas_últimas_2h / 2)
// Riesgo Quiebre = P(stock=0 antes del próximo ingreso) = f(tasa_venta, stock, horas_a_reposición)
// FROM products p LEFT JOIN stock_movements sm USING(product_id)
// WHERE sm.movement_type_id = (SELECT id FROM stock_movement_types WHERE name='sale')
//   AND sm.created_at >= NOW() - INTERVAL '2 hours'
const stockCritico = [
  {producto:"Croissant",      actual:8,  minimo:10, tea:"1.5h", riesgoTEA:87, riesgoQuiebre:92, horasReposicion:4},
  {producto:"Empanada Queso", actual:14, minimo:10, tea:"2.2h", riesgoTEA:65, riesgoQuiebre:78, horasReposicion:6},
  {producto:"Jugo Natural",   actual:11, minimo:10, tea:"3.1h", riesgoTEA:55, riesgoQuiebre:61, horasReposicion:8},
  {producto:"Sándwich Frío",  actual:22, minimo:15, tea:"4.8h", riesgoTEA:32, riesgoQuiebre:35, horasReposicion:12},
  {producto:"Café Americano", actual:45, minimo:20, tea:"8h+",  riesgoTEA:12, riesgoQuiebre:8,  horasReposicion:24},
];

// ── MIX DE PAGO ───────────────────────────────────────────────────────────────
// CON TURNO: WHERE uo.shift_record_id = :shift_id   → datos del turno actual
// SIN TURNO: WHERE uo.created_at::date = CURRENT_DATE → datos del día completo
// FROM order_payments op JOIN payment_methods pm USING(payment_method_id)
// JOIN user_orders uo USING(user_order_id) WHERE uo.status='paid'
const metodoPago_turno = [
  {name:"Efectivo",value:62,color:"#f59e0b"},
  {name:"Tarjeta",value:25,color:"#6366f1"},
  {name:"Transferencia",value:13,color:"#10b981"},
];
const metodoPago_dia = [
  {name:"Efectivo",value:58,color:"#f59e0b"},
  {name:"Tarjeta",value:28,color:"#6366f1"},
  {name:"Transferencia",value:14,color:"#10b981"},
];

// ── MATRIZ DE MENÚ ────────────────────────────────────────────────────────────
// SELECT p.name, SUM(oi.quantity) as uds, SUM(oi.subtotal) as ingresos
// FROM order_items oi JOIN products p USING(product_id)
// JOIN user_orders uo USING(user_order_id)
// WHERE uo.status='paid' AND uo.created_at::date = CURRENT_DATE
// ORDER BY ingresos DESC
// Clasificación: Estrellas(alta venta+altos ingresos), Vacas(bajos uds+altos ingresos),
//                Interrogante(media venta), Zombies(baja venta+bajos ingresos)
const menuMatrix = [
  {producto:"Capuchino",  uds:142, ingresos:1136, tipo:"estrella"},
  {producto:"Croissant",  uds:118, ingresos:826,  tipo:"estrella"},
  {producto:"Empanada",   uds:95,  ingresos:570,  tipo:"estrella"},
  {producto:"Torta Choc.",uds:67,  ingresos:804,  tipo:"vaca"},
  {producto:"Sándwich",   uds:43,  ingresos:387,  tipo:"interrogante"},
  {producto:"Té Verde",   uds:12,  ingresos:72,   tipo:"zombie"},
  {producto:"Brownie",    uds:8,   ingresos:64,   tipo:"zombie"},
];

// ── CROSS-SELLING ─────────────────────────────────────────────────────────────
// SELECT p1.name as prod_a, p2.name as prod_b,
//        COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT user_order_id) FROM order_items) as afinidad,
//        COUNT(*) * AVG(p2.sale_price) as ingreso_potencial
// FROM order_items a JOIN order_items b ON a.user_order_id=b.user_order_id
//   AND a.product_id < b.product_id
// JOIN products p1 ON a.product_id=p1.product_id
// JOIN products p2 ON b.product_id=p2.product_id
// GROUP BY 1,2 ORDER BY afinidad DESC LIMIT 5
const crossSell = [
  {a:"☕ Café Americano",b:"🥐 Croissant",    pct:72, bs:284, combo:"Combo Mañanero"},
  {a:"🧃 Jugo Natural",  b:"🥪 Sándwich",     pct:58, bs:196, combo:"Combo Fresco"},
  {a:"🍰 Torta",         b:"☕ Capuchino",    pct:49, bs:230, combo:"Combo Tarde"},
  {a:"🥟 Empanada",      b:"🧃 Jugo Natural", pct:41, bs:148, combo:"Combo Ligero"},
];

// ── PROYECCIÓN DE DEMANDA POR TURNO ──────────────────────────────────────────
// Promedio histórico por (product_id, day_of_week, shift_hour_block)
// SELECT product_id, AVG(qty) as proyectado
// FROM (SELECT oi.product_id, SUM(oi.quantity) as qty,
//         DATE_TRUNC('day', uo.created_at) as dia
//       FROM order_items oi JOIN user_orders uo USING(user_order_id)
//       WHERE EXTRACT(dow FROM uo.created_at) = EXTRACT(dow FROM NOW())
//         AND uo.status='paid'
//       GROUP BY 1,3) t
// GROUP BY 1
const proyeccionTurno = [
  {item:"Capuchino",proyectado:45,vendido:38},
  {item:"Croissant",proyectado:40,vendido:35},
  {item:"Empanada", proyectado:32,vendido:28},
  {item:"Torta",    proyectado:20,vendido:22},
  {item:"Sándwich", proyectado:18,vendido:12},
];

// ── MERMAS ────────────────────────────────────────────────────────────────────
// FROM stock_movements sm JOIN products p USING(product_id)
// JOIN stock_movement_types smt USING(movement_type_id)
// WHERE smt.name='shrinkage'
//   AND sm.created_at::date = CURRENT_DATE
// (proyectadas: promedio merma histórica mismo día de semana)
const mermas = [
  {prod:"Sándwich Frío",uds:15,bs:135,urgencia:"alta"},
  {prod:"Jugo Natural", uds:6, bs:42, urgencia:"media"},
  {prod:"Croissant",    uds:4, bs:28, urgencia:"baja"},
];

// ── CONGESTIÓN PRONOSTICADA ───────────────────────────────────────────────────
// AVG tickets/hora agrupados por (EXTRACT(dow), EXTRACT(hour)) — historial
// FROM user_orders WHERE status='paid'
// GROUP BY EXTRACT(dow FROM created_at), EXTRACT(hour FROM created_at)
const congestion = [
  {hora:"08h",t:18},{hora:"09h",t:32},{hora:"10h",t:48},
  {hora:"11h",t:52},{hora:"12h",t:41},{hora:"13h",t:38},
];

// ── TENDENCIA DE CATEGORÍAS ───────────────────────────────────────────────────
// SELECT c.name as categoria, DATE_TRUNC('day', uo.created_at) as dia, SUM(oi.quantity)
// FROM order_items oi JOIN products p USING(product_id) JOIN categories c USING(category_id)
// JOIN user_orders uo USING(user_order_id) WHERE uo.status='paid'
// AND uo.created_at >= NOW() - INTERVAL '7 days'
// GROUP BY 1,2
const tendenciaCat = [
  {dia:"L",calientes:380,frias:120},{dia:"M",calientes:360,frias:145},
  {dia:"X",calientes:340,frias:180},{dia:"J",calientes:310,frias:210},
  {dia:"V",calientes:290,frias:250},{dia:"S",calientes:260,frias:290},
  {dia:"H",calientes:240,frias:310},
];

// ── SENSIBILIDAD AL PRECIO ────────────────────────────────────────────────────
// Cambios de precio desde audit_log WHERE action='price_change'
// cruzados con ventas diarias por producto
// audit_log.previous_value → precio antes / new_value → precio después
const sensibilidad = [
  {dia:"L",cap:142,emp:95},{dia:"M",cap:138,emp:88},
  {dia:"X",cap:120,emp:102},{dia:"J",cap:118,emp:97},
  {dia:"V",cap:105,emp:91},{dia:"S",cap:98,emp:85},{dia:"H",cap:95,emp:78},
];
// El Miércoles se registró price_change en Capuchino: 7→9 Bs → caída -33%

// ── CAJEROS ───────────────────────────────────────────────────────────────────
// score = ventas_turno/expected_amount*100 - ABS(discrepancy)/expected_amount*100
// FROM shift_records WHERE status='closed' AND created_at >= THIS_MONTH
const cajeros = [
  {nombre:"Carlos M.", ventas:8430,discrepancia:-12, esperado:8442,score:94.1,turnos:18,radar:[90,95,82,78,88]},
  {nombre:"Daniela R.",ventas:6280,discrepancia:-185,esperado:6465,score:71.3,turnos:15,radar:[74,60,88,55,72]},
  {nombre:"Roberto C.",ventas:7120,discrepancia:-8,  esperado:7128,score:88.7,turnos:12,radar:[83,90,76,85,80]},
];
const RADAR_KEYS = ["Ventas","Precisión","Velocidad","Efectivo","Atención"];

// ── KPIs GLOBALES DEL DÍA ─────────────────────────────────────────────────────
const KPI_DIA = {
  ventas_total:18430, tickets:247, ticket_prom:74.6,
  costo_oportunidad:340, descuadre_total:-197, turnos_cerrados:2,
};

const efectivoCaja = {acumulado:2840, umbral:3000, pct:94.7};

// ══════════════════════════════════════════════════════════════════════════════
//  HELPERS UI
// ══════════════════════════════════════════════════════════════════════════════
const RC  = r => r>=80?"#ef4444":r>=50?"#f59e0b":"#10b981";
const TT  = {backgroundColor:"#1a1510",border:"1px solid #3d2f1a",borderRadius:"8px",color:"#f5e6c8",fontSize:"12px"};
const TIPO_COLOR = {
  estrella:    {bg:"rgba(245,158,11,0.15)", border:"#f59e0b", label:"⭐ Estrella"},
  vaca:        {bg:"rgba(99,102,241,0.15)", border:"#6366f1", label:"🐄 Vaca Lechera"},
  interrogante:{bg:"rgba(16,185,129,0.15)",border:"#10b981", label:"❓ Interrogante"},
  zombie:      {bg:"rgba(239,68,68,0.15)", border:"#ef4444", label:"🧟 Zombie"},
};

function Card({title,icon,children,accent="#f59e0b",badge,wide=false,full=false}){
  return(
    <div style={{
      background:"linear-gradient(145deg,#1c160e 0%,#221a0f 100%)",
      border:`1px solid ${accent}33`,borderRadius:16,padding:20,
      position:"relative",overflow:"hidden",
      gridColumn:full?"1/-1":wide?"span 2":undefined,
      boxShadow:`0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 ${accent}18`,
    }}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${accent},transparent)`}}/>
      <div style={{position:"absolute",top:-60,right:-60,width:160,height:160,borderRadius:"50%",background:`radial-gradient(circle,${accent}08 0%,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:18}}>{icon}</span>
        <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:12,fontWeight:600,color:"#c8a96e",letterSpacing:"0.06em",textTransform:"uppercase"}}>{title}</span>
        {badge&&<span style={{marginLeft:"auto",fontSize:10,padding:"2px 8px",borderRadius:20,background:`${accent}22`,color:accent,border:`1px solid ${accent}44`,fontWeight:700}}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function Num({v,unit,sub,color="#f5e6c8",size=36}){
  return(
    <div>
      <div style={{display:"flex",alignItems:"baseline",gap:6}}>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:size,fontWeight:700,color,lineHeight:1}}>{v}</span>
        {unit&&<span style={{fontSize:13,color:"#8b7355",fontWeight:500}}>{unit}</span>}
      </div>
      {sub&&<div style={{fontSize:11,color:"#6b5a3e",marginTop:3}}>{sub}</div>}
    </div>
  );
}

function Decision({text,color="#f59e0b"}){
  return(
    <div style={{
      marginTop:10,padding:"9px 12px",borderRadius:8,
      background:`${color}10`,border:`1px solid ${color}25`,
      fontSize:11,color:`${color}ee`,lineHeight:1.5,
    }}>
      <span style={{fontWeight:700,marginRight:4}}>→ Decisión:</span>{text}
    </div>
  );
}

function Alert2({text,color="#f59e0b"}){
  return(
    <div style={{marginTop:8,padding:"7px 12px",borderRadius:8,background:`${color}10`,border:`1px solid ${color}22`,fontSize:11,color:`${color}cc`}}>
      {text}
    </div>
  );
}

function RBar({producto,actual,minimo,tea,riesgoTEA,riesgoQuiebre}){
  const pct=Math.min((actual/(minimo*2))*100,100);
  const c=RC(riesgoTEA);
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
        <span style={{fontSize:12,color:"#c8a96e",fontWeight:600}}>{producto}</span>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:10,color:"#6b5a3e"}}>⏱ TEA: {tea}</span>
          <span style={{fontSize:10,color:RC(riesgoQuiebre),fontWeight:700}}>Q:{riesgoQuiebre}%</span>
        </div>
      </div>
      <div style={{height:5,borderRadius:3,background:"#2a1f0f",overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,borderRadius:3,background:`linear-gradient(90deg,${c},${c}88)`}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
        <span style={{fontSize:9,color:"#4a3828"}}>Stock: {actual} uds · Mín: {minimo}</span>
        <span style={{fontSize:9,color:"#4a3828"}}>Riesgo agotamiento: <span style={{color:c}}>{riesgoTEA}%</span></span>
      </div>
    </div>
  );
}

// ── MAPA DE CALOR REAL ────────────────────────────────────────────────────────
function HeatMap(){
  const maxVal=2500;
  const getColor=(v)=>{
    if(v<200)  return{bg:"#1a1208",text:"#3d2f1a"};
    if(v<600)  return{bg:"#2d1e0a",text:"#6b5a3e"};
    if(v<1000) return{bg:"#4a2e08",text:"#c8a96e"};
    if(v<1500) return{bg:"#7a4a0a",text:"#f5e6c8"};
    if(v<2000) return{bg:"#c47a0a",text:"#fff"};
    return{bg:"#f59e0b",text:"#1a0e00"};
  };
  return(
    <div>
      <div style={{overflowX:"auto"}}>
        <table style={{borderCollapse:"separate",borderSpacing:3,fontSize:10,width:"100%"}}>
          <thead>
            <tr>
              <td style={{width:36,color:"#4a3828",fontSize:9,paddingBottom:4}}></td>
              {HORAS.map(h=>(
                <td key={h} style={{textAlign:"center",color:"#6b5a3e",fontSize:9,paddingBottom:4,fontWeight:600}}>{h}h</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {DIAS.map((dia,di)=>(
              <tr key={dia}>
                <td style={{color:"#8b7355",fontSize:10,fontWeight:600,paddingRight:6,whiteSpace:"nowrap"}}>{dia}</td>
                {heatmapData[di].map((cell,hi)=>{
                  const {bg,text}=getColor(cell.ventas);
                  return(
                    <td key={hi} title={`${dia} ${cell.hora}h: Bs ${cell.ventas.toLocaleString()}`}
                      style={{
                        background:bg,borderRadius:5,width:32,height:22,
                        textAlign:"center",color:text,fontWeight:600,fontSize:9,
                        cursor:"default",transition:"transform 0.1s",
                      }}
                      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.3)";e.currentTarget.style.zIndex=10;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.zIndex=1;}}
                    >
                      {cell.ventas>=600?Math.round(cell.ventas/100)+"":""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* leyenda */}
      <div style={{display:"flex",gap:6,marginTop:12,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontSize:9,color:"#4a3828",marginRight:4}}>Ventas Bs:</span>
        {[
          ["#1a1208","< 200"],["#2d1e0a","200-600"],["#4a2e08","600-1k"],
          ["#7a4a0a","1k-1.5k"],["#c47a0a","1.5k-2k"],["#f59e0b","> 2k"],
        ].map(([c,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:12,height:12,borderRadius:2,background:c,border:"1px solid #2a1f0f"}}/>
            <span style={{fontSize:9,color:"#6b5a3e"}}>{l}</span>
          </div>
        ))}
        <span style={{fontSize:9,color:"#4a3828",marginLeft:8}}>· Hover para ver valor</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  PANTALLA SIN TURNO ACTIVO
//  ¿Qué datos son seguros sin shift_record_id?
//  ✅ ventas del día (user_orders WHERE created_at::date = TODAY, status='paid')
//  ✅ stock actual (products — no depende de turno)
//  ✅ matriz de menú (order_items del día completo)
//  ✅ mix de pago del día (order_payments del día completo)
//  ✅ mermas registradas (stock_movements tipo 'shrinkage' del día)
//  ✅ resumen de turnos cerrados (shift_records WHERE status='closed' AND today)
//  ✅ heatmap histórico (order_items últimos 7 días)
//  ✅ tendencia de categorías (histórico)
//  ❌ efectivo acumulado en caja activa → NO disponible (requiere turno abierto)
//  ❌ proyección del turno actual → NO disponible
//  ❌ fatiga del cajero → NO disponible (no hay cajero activo)
// ══════════════════════════════════════════════════════════════════════════════
function SinTurno({ahora}){
  const metodoPago = metodoPago_dia;
  return(
    <div style={{padding:"24px 32px"}}>
      {/* Banner */}
      <div style={{
        display:"flex",alignItems:"center",gap:20,padding:"20px 28px",
        background:"linear-gradient(135deg,#1c160e,#130e06)",
        border:"1px solid #2a1f0f",borderRadius:16,marginBottom:24,
      }}>
        <div style={{width:44,height:44,borderRadius:10,background:"rgba(107,90,62,0.1)",border:"1px solid #3d2f1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🌙</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#c8a96e"}}>Sin turno activo</div>
          <div style={{fontSize:11,color:"#6b5a3e",marginTop:2}}>No hay caja abierta · {ahora.toLocaleDateString("es-BO",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
        <div style={{marginLeft:"auto",padding:"10px 18px",borderRadius:10,background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)"}}>
          <div style={{fontSize:11,color:"#6b5a3e"}}>Próxima acción</div>
          <div style={{fontSize:12,color:"#f59e0b",fontWeight:600,marginTop:2}}>→ Abrir turno desde el módulo POS</div>
        </div>
      </div>

      {/* Resumen del día */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
        {[
          {label:"Ventas del Día",v:`Bs ${KPI_DIA.ventas_total.toLocaleString()}`,icon:"💰",color:"#f59e0b",sub:`${KPI_DIA.tickets} tickets cobrados`},
          {label:"Ticket Promedio",v:`Bs ${KPI_DIA.ticket_prom}`,icon:"🧾",color:"#10b981",sub:"Por orden pagada"},
          {label:"Costo por Quiebre",v:`Bs ${KPI_DIA.costo_oportunidad}`,icon:"📉",color:"#ef4444",sub:"Ventas perdidas hoy"},
          {label:"Descuadre Neto",v:`Bs ${KPI_DIA.descuadre_total}`,icon:"⚖️",color:Math.abs(KPI_DIA.descuadre_total)>100?"#ef4444":"#10b981",sub:`${KPI_DIA.turnos_cerrados} turnos cerrados hoy`},
        ].map((k,i)=>(
          <Card key={i} title={k.label} icon={k.icon} accent={k.color}>
            <Num v={k.v} color={k.color} size={24} sub={k.sub}/>
          </Card>
        ))}
      </div>

      {/* Turnos cerrados del día */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
        <Card title="Turnos Cerrados Hoy" icon="📋" accent="#6366f1">
          <div style={{fontSize:10,color:"#4a3828",marginBottom:10}}>
            FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>shift_records WHERE status='closed' AND opened_at::date = TODAY</code>
          </div>
          {[
            {id:11,cajero:"Daniela R.",apertura:"07:00",cierre:"11:00",ventas:4120,disc:-35,esperado:4155},
            {id:12,cajero:"Roberto C.",apertura:"11:00",cierre:"12:00",ventas:3210,disc:+8,esperado:3202},
            {id:14,cajero:"Carlos M.", apertura:"12:00",cierre:"18:00",ventas:8430,disc:-12,esperado:8442},
          ].map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:10,background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.12)",marginBottom:8}}>
              <div style={{fontSize:18}}>✅</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,color:"#c8a96e",fontWeight:600}}>{t.cajero}</div>
                <div style={{fontSize:10,color:"#6b5a3e"}}>{t.apertura} → {t.cierre}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:13,color:"#f5e6c8",fontWeight:600}}>Bs {t.ventas.toLocaleString()}</div>
                <div style={{fontSize:10,color:Math.abs(t.disc)>50?"#ef4444":"#10b981"}}>
                  descuadre: {t.disc>=0?"+":""}{t.disc} Bs
                </div>
              </div>
            </div>
          ))}
          <Decision text="Daniela R. con descuadre –35 Bs: revisar arqueo. Roberto C. sin issues." color="#6366f1"/>
        </Card>

        {/* Stock actual — disponible siempre */}
        <Card title="Stock Actual (tiempo real)" icon="📦" accent="#f59e0b">
          <div style={{fontSize:10,color:"#4a3828",marginBottom:10}}>
            FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>products WHERE active=true ORDER BY (current_stock/min_stock)</code>
          </div>
          <div style={{fontSize:10,color:"#6b5a3e",marginBottom:8}}>⚠ Estos datos NO dependen del turno — están disponibles siempre</div>
          {stockCritico.map(s=>(
            <div key={s.producto} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 10px",borderRadius:7,background:"rgba(255,255,255,0.02)",border:"1px solid #2a1f0f",marginBottom:6}}>
              <span style={{fontSize:12,color:"#c8a96e",fontWeight:600}}>{s.producto}</span>
              <div style={{display:"flex",gap:16,alignItems:"center"}}>
                <span style={{fontSize:11,color:"#6b5a3e"}}>Stock: {s.actual}</span>
                <span style={{fontSize:11,color:"#4a3828"}}>Mín: {s.minimo}</span>
                <span style={{fontSize:11,color:RC(s.riesgoTEA),fontWeight:700}}>{s.actual<=s.minimo?"⚠ BAJO":"✓ OK"}</span>
              </div>
            </div>
          ))}
          <Decision text="Croissant por debajo del mínimo: reponer antes de abrir el próximo turno." color="#f59e0b"/>
        </Card>
      </div>

      {/* Heatmap + Tendencia */}
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:18}}>
        <Card title="Mapa de Calor — Ventas por Hora × Día (7 días)" icon="🌡️" accent="#f59e0b">
          <div style={{fontSize:10,color:"#4a3828",marginBottom:10}}>
            Disponible sin turno activo · FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>user_orders × order_items GROUP BY dow, hour</code>
          </div>
          <HeatMap/>
          <Decision text="Las horas 09h–14h son oro puro. Reforzar stock y personal en ese bloque todos los días." color="#f59e0b"/>
        </Card>

        <Card title="Tendencia de Categorías" icon="📈" accent="#10b981">
          <div style={{height:170}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tendenciaCat} margin={{top:4,right:0,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gF" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f160a"/>
                <XAxis dataKey="dia" tick={{fontSize:10,fill:"#6b5a3e"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"#4a3828"}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={TT}/>
                <Area type="monotone" dataKey="calientes" name="Calientes" stroke="#ef4444" fill="url(#gC)" strokeWidth={2}/>
                <Area type="monotone" dataKey="frias" name="Frías" stroke="#10b981" fill="url(#gF)" strokeWidth={2}/>
                <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10,color:"#6b5a3e"}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <Decision text="Bebidas Frías superarán a Calientes este fin de semana — reorganizar vitrina y publicidad." color="#10b981"/>
        </Card>
      </div>

      {/* Matriz de menú + cross-sell */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card title="Matriz de Menú (hoy)" icon="🍽️" accent="#f59e0b">
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {menuMatrix.map((p,i)=>{
              const c=TIPO_COLOR[p.tipo];
              return(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 12px",borderRadius:8,background:c.bg,border:`1px solid ${c.border}33`}}>
                  <div style={{width:3,height:28,borderRadius:2,background:c.border}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#f5e6c8",fontWeight:600}}>{p.producto}</div>
                    <div style={{fontSize:9,color:"#6b5a3e"}}>{c.label} · {p.uds} uds</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:12,color:c.border,fontWeight:700}}>Bs {p.ingresos}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <Decision text="Promover Capuchino+Croissant (estrellas). Eliminar Té Verde y Brownie del menú o reformularlos." color="#f59e0b"/>
        </Card>

        <Card title="Mix de Pago del Día" icon="💳" accent="#10b981">
          <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
            ⚠ Sin turno activo: datos del día completo · <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>WHERE created_at::date = TODAY</code>
          </div>
          <div style={{height:140,position:"relative"}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={metodoPago} cx="50%" cy="50%" innerRadius={38} outerRadius:60 paddingAngle={3} dataKey="value">
                  {metodoPago.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
                <Tooltip contentStyle={TT} formatter={v=>[`${v}%`,""]}/>
              </PieChart>
            </ResponsiveContainer>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
              <div style={{fontSize:18,fontFamily:"serif",color:"#f5e6c8",fontWeight:700}}>{KPI_DIA.tickets}</div>
              <div style={{fontSize:9,color:"#6b5a3e"}}>tickets</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:5,marginTop:6}}>
            {metodoPago.map(m=>(
              <div key={m.name} style={{display:"flex",justifyContent:"space-between"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:m.color}}/>
                  <span style={{fontSize:11,color:"#8b7355"}}>{m.name}</span>
                </div>
                <span style={{fontSize:11,color:m.color,fontWeight:700}}>{m.value}%</span>
              </div>
            ))}
          </div>
          <Decision text="58% efectivo: alta acumulación de efectivo físico. Verificar umbral de sangría al abrir el próximo turno." color="#10b981"/>
        </Card>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  DASHBOARD CON TURNO ACTIVO
// ══════════════════════════════════════════════════════════════════════════════
export default function CafeteriaDashboard(){
  const [tab,setTab]=useState("principal");
  const [ahora,setAhora]=useState(new Date());
  useEffect(()=>{const t=setInterval(()=>setAhora(new Date()),1000);return()=>clearInterval(t);},[]);

  const fatiga_horas=TURNO_ACTUAL?.horas||0;
  const fatiga_pagos=TURNO_ACTUAL?.pagos_efectivo_consecutivos||0;
  const riesgo_fatiga=Math.min(Math.round((fatiga_horas/8)*40+(fatiga_pagos/80)*60),100);
  const metodoPago = TURNO_ABIERTO ? metodoPago_turno : metodoPago_dia;

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#0e0a04 0%,#130e06 50%,#0e0a04 100%)",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#f5e6c8"}}>
      {/* HEADER */}
      <header style={{borderBottom:"1px solid #2a1f0f",background:"linear-gradient(90deg,#130e06,#1a1208,#130e06)",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <span style={{fontSize:26}}>☕</span>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#f5e6c8"}}>Cafetería Comercial</div>
            <div style={{fontSize:10,color:"#4a3828",letterSpacing:"0.1em",textTransform:"uppercase"}}>Panel Administrador · DSS</div>
          </div>
        </div>
        {TURNO_ABIERTO&&(
          <div style={{display:"flex",gap:6}}>
            {["principal","marketing","predictivo"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:"5px 14px",borderRadius:20,border:"1px solid",
                borderColor:tab===t?"#f59e0b":"#2a1f0f",
                background:tab===t?"rgba(245,158,11,0.15)":"transparent",
                color:tab===t?"#f59e0b":"#6b5a3e",
                fontSize:11,fontWeight:600,cursor:"pointer",
              }}>
                {t==="principal"?"🏠 Principal":t==="marketing"?"🎯 Marketing":"🔮 Predictivo"}
              </button>
            ))}
          </div>
        )}
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"4px 14px",borderRadius:20,
            background:TURNO_ABIERTO?"rgba(16,185,129,0.1)":"rgba(107,90,62,0.1)",
            border:`1px solid ${TURNO_ABIERTO?"rgba(16,185,129,0.3)":"#2a1f0f"}`}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:TURNO_ABIERTO?"#10b981":"#4a3828",boxShadow:TURNO_ABIERTO?"0 0 8px #10b981":"none"}}/>
            <span style={{fontSize:11,color:TURNO_ABIERTO?"#6ee7b7":"#4a3828",fontWeight:600}}>
              {TURNO_ABIERTO?`Turno #${TURNO_ACTUAL.shift_record_id} · ${TURNO_ACTUAL.cajero}`:"Sin turno activo"}
            </span>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:18,fontFamily:"'Playfair Display',serif",color:"#c8a96e",fontWeight:700}}>{ahora.toLocaleTimeString("es-BO")}</div>
            <div style={{fontSize:10,color:"#4a3828"}}>{ahora.toLocaleDateString("es-BO",{day:"numeric",month:"short"})}</div>
          </div>
        </div>
      </header>

      {!TURNO_ABIERTO&&<SinTurno ahora={ahora}/>}

      {TURNO_ABIERTO&&(
        <div style={{padding:"22px 32px"}}>
          {/* Status Bar */}
          <div style={{display:"flex",gap:10,marginBottom:22,background:"rgba(245,158,11,0.04)",border:"1px solid #2a1f0f",borderRadius:10,padding:"10px 18px",alignItems:"center",flexWrap:"wrap"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 8px #10b981"}}/>
            <span style={{fontSize:11,color:"#6b5a3e"}}>Turno:</span>
            <span style={{fontSize:11,color:"#c8a96e",fontWeight:600}}>Tarde 12:00–18:00</span>
            <span style={{color:"#2a1f0f",margin:"0 6px"}}>|</span>
            <span style={{fontSize:11,color:"#6b5a3e"}}>Cajero:</span>
            <span style={{fontSize:11,color:"#c8a96e",fontWeight:600}}>{TURNO_ACTUAL.cajero}</span>
            <span style={{color:"#2a1f0f",margin:"0 6px"}}>|</span>
            <span style={{fontSize:11,color:"#6b5a3e"}}>En turno:</span>
            <span style={{fontSize:11,color:fatiga_horas>=5?"#ef4444":"#f59e0b",fontWeight:700}}>{fatiga_horas}h</span>
            {fatiga_horas>=3&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:12,background:"rgba(239,68,68,0.15)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.3)",fontWeight:700}}>⚠ Fatiga</span>}
            <div style={{marginLeft:"auto",display:"flex",gap:20}}>
              <span style={{fontSize:11,color:"#6b5a3e"}}>Tickets: <span style={{color:"#c8a96e",fontWeight:700}}>{KPI_DIA.tickets}</span></span>
              <span style={{fontSize:11,color:"#6b5a3e"}}>Ventas hoy: <span style={{color:"#f59e0b",fontWeight:700}}>Bs {KPI_DIA.ventas_total.toLocaleString()}</span></span>
              <span style={{fontSize:11,color:"#6b5a3e"}}>Ticket prom: <span style={{color:"#c8a96e",fontWeight:700}}>Bs {KPI_DIA.ticket_prom}</span></span>
            </div>
          </div>

          {/* ══ PRINCIPAL ══ */}
          {tab==="principal"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>
                {/* KPI 1: Ventas del Día */}
                <Card title="Ventas del Día" icon="💰" badge="EN VIVO" accent="#f59e0b">
                  <Num v={`${(KPI_DIA.ventas_total/1000).toFixed(1)}k`} unit="Bs" sub="↑ +12.4% vs ayer" color="#f59e0b"/>
                  <div style={{height:52,marginTop:10}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={ventasPorHora.slice(-6)}>
                        <defs><linearGradient id="gV" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4}/><stop offset="100%" stopColor="#f59e0b" stopOpacity={0}/></linearGradient></defs>
                        <Area type="monotone" dataKey="ventas" stroke="#f59e0b" strokeWidth={2} fill="url(#gV)" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <Decision text="Ventas en tendencia positiva. Mantener stock de productos estrella activo para el pico de 13h." color="#f59e0b"/>
                </Card>

                {/* KPI HOLÍSTICO 1: Costo de Oportunidad por Quiebre */}
                <Card title="Costo de Oportunidad" icon="📉" accent="#ef4444">
                  <Num v={`Bs ${KPI_DIA.costo_oportunidad}`} color="#ef4444" sub="Ventas perdidas por quiebre de stock hoy" size={30}/>
                  <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                      <span style={{color:"#6b5a3e"}}>Productos en quiebre hoy</span>
                      <span style={{color:"#ef4444",fontWeight:700}}>3 productos</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                      <span style={{color:"#6b5a3e"}}>Hora más afectada</span>
                      <span style={{color:"#f59e0b",fontWeight:700}}>08:00–11:00</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                      <span style={{color:"#6b5a3e"}}>Producto más costoso</span>
                      <span style={{color:"#ef4444",fontWeight:700}}>Empanada → –Bs 220</span>
                    </div>
                  </div>
                  <Decision text="Priorizar abastecimiento de Empanadas antes de abrir caja. Este producto solo entre 08:00 y 11:00 generó Bs 220 de pérdida." color="#ef4444"/>
                </Card>

                {/* KPI HOLÍSTICO 2: Eficiencia del Cajero */}
                <Card title="Eficiencia del Cajero (Turno)" icon="👤" badge={cajeros[0].nombre} accent="#6366f1">
                  <Num v={`${cajeros[0].score}%`} color="#818cf8" sub={`Ventas Bs ${cajeros[0].ventas.toLocaleString()} · Descuadre Bs ${cajeros[0].discrepancia}`} size={32}/>
                  <div style={{height:62,marginTop:8}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={RADAR_KEYS.map((k,i)=>({subject:k,v:cajeros[0].radar[i]}))} outerRadius={26}>
                        <PolarGrid stroke="#2a1f0f"/>
                        <PolarAngleAxis dataKey="subject" tick={{fontSize:7,fill:"#6b5a3e"}}/>
                        <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.28}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <Decision text="Carlos M. con score 94.1% es tu cajero más valioso hoy. Descuadre –12 Bs dentro del umbral." color="#6366f1"/>
                </Card>
              </div>

              {/* HEATMAP COMPLETO */}
              <div style={{marginBottom:14}}>
                <Card title="Mapa de Calor — Ventas por Hora × Día de la Semana" icon="🌡️" accent="#f59e0b" full>
                  <div style={{fontSize:10,color:"#4a3828",marginBottom:10}}>
                    Últimos 7 días · FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>user_orders × order_items GROUP BY EXTRACT(dow), EXTRACT(hour)</code> · Hover sobre cada celda para ver el valor exacto
                  </div>
                  <HeatMap/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginTop:14}}>
                    <Decision text="Horas 09h–14h son las 'Horas Doradas'. Reforzar stock y cajeros en ese bloque todos los días." color="#f59e0b"/>
                    <Decision text="Mañanas de Sábado y Domingo superan +30% vs días laborables. Planificar reposición el viernes." color="#10b981"/>
                    <Decision text="Horas 15h–17h son 'muertas' en postres. Lanzar Happy Hour de pastelería en ese bloque." color="#6366f1"/>
                  </div>
                </Card>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:14,marginBottom:14}}>
                {/* TEA + Riesgo de Quiebre */}
                <Card title="Stock Crítico — TEA + Riesgo de Quiebre" icon="⚠️" badge="CRÍTICO" accent="#ef4444">
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:8}}>
                    <div style={{fontSize:10,color:"#4a3828"}}>
                      <strong style={{color:"#ef4444"}}>TEA</strong> = (stock_actual - min_stock) / tasa_venta_última_2h
                    </div>
                    <div style={{fontSize:10,color:"#4a3828"}}>
                      <strong style={{color:"#f59e0b"}}>Riesgo Quiebre (Q)</strong> = P(stock=0 antes del próximo ingreso)
                    </div>
                  </div>
                  {stockCritico.map(s=><RBar key={s.producto} {...s}/>)}
                  <Decision text="Croissant bajo el mínimo YA (TEA: 1.5h, Q:92%): contactar proveedor ahora. Empanada Queso con 78% de quiebre: sacar más de bodega." color="#ef4444"/>
                </Card>

                {/* Mix de Pago DEL TURNO */}
                <Card title="Mix de Pago — Turno Actual" icon="💳" accent="#10b981">
                  <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                    ⚠ Datos del turno activo · <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>WHERE shift_record_id = {TURNO_ACTUAL.shift_record_id}</code>
                  </div>
                  <div style={{height:130,position:"relative"}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={metodoPago} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                          {metodoPago.map((e,i)=><Cell key={i} fill={e.color}/>)}
                        </Pie>
                        <Tooltip contentStyle={TT} formatter={v=>[`${v}%`,""]}/>
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center"}}>
                      <div style={{fontSize:16,fontFamily:"serif",color:"#f5e6c8",fontWeight:700}}>{KPI_DIA.tickets}</div>
                      <div style={{fontSize:8,color:"#6b5a3e"}}>tickets</div>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:6}}>
                    {metodoPago.map(m=>(
                      <div key={m.name} style={{display:"flex",justifyContent:"space-between"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:"50%",background:m.color}}/><span style={{fontSize:11,color:"#8b7355"}}>{m.name}</span></div>
                        <span style={{fontSize:11,color:m.color,fontWeight:700}}>{m.value}%</span>
                      </div>
                    ))}
                  </div>
                  <Decision text="62% en efectivo: caja en 94.7% del umbral. Programar sangría en 12 min." color="#10b981"/>
                </Card>
              </div>

              {/* Proyección del turno */}
              <Card title="Proyección del Turno Actual vs Vendido Real" icon="🔮" accent="#6366f1" full>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                  <div>
                    <div style={{fontSize:10,color:"#4a3828",marginBottom:10}}>
                      Proyectado = promedio histórico mismo día de semana · FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>order_items GROUP BY product_id, EXTRACT(dow)</code>
                    </div>
                    <div style={{height:185}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={proyeccionTurno} layout="vertical" margin={{top:0,right:14,left:6,bottom:0}}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f160a" horizontal={false}/>
                          <XAxis type="number" tick={{fontSize:9,fill:"#4a3828"}} axisLine={false} tickLine={false}/>
                          <YAxis type="category" dataKey="item" tick={{fontSize:11,fill:"#8b7355"}} axisLine={false} tickLine={false} width={64}/>
                          <Tooltip contentStyle={TT}/>
                          <Bar dataKey="proyectado" name="Proyectado" fill="#6366f120" radius={[0,4,4,0]}/>
                          <Bar dataKey="vendido" name="Vendido" fill="#6366f1" radius={[0,4,4,0]}/>
                          <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10,color:"#6b5a3e"}}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10,paddingTop:30}}>
                    {proyeccionTurno.map((p,i)=>{
                      const gap=p.vendido-p.proyectado;
                      const pct=Math.round((p.vendido/p.proyectado)*100);
                      return(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:"1px solid #2a1f0f"}}>
                          <span style={{fontSize:12,color:"#c8a96e",fontWeight:600}}>{p.item}</span>
                          <div style={{display:"flex",gap:10,alignItems:"center"}}>
                            <span style={{fontSize:11,color:"#6b5a3e"}}>{p.vendido}/{p.proyectado}</span>
                            <span style={{fontSize:11,fontWeight:700,color:pct>=90?"#10b981":pct>=70?"#f59e0b":"#ef4444"}}>{pct}%</span>
                            <span style={{fontSize:10,color:gap>=0?"#10b981":"#ef4444"}}>{gap>=0?"↑":"↓"}{Math.abs(gap)}</span>
                          </div>
                        </div>
                      );
                    })}
                    <Decision text="Sándwich al 67% del pronóstico: revisar disponibilidad. Torta supera el pronóstico: preparar unidades extra para las próximas 2h." color="#6366f1"/>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* ══ MARKETING ══ */}
          {tab==="marketing"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              {/* Matriz Estrellas vs Zombies */}
              <Card title="Matriz Estrellas vs Zombies" icon="🍽️" accent="#f59e0b">
                <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                  Ejes: unidades vendidas (demanda) × ingresos generados (rentabilidad)
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {menuMatrix.map((p,i)=>{
                    const c=TIPO_COLOR[p.tipo];
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:9,background:c.bg,border:`1px solid ${c.border}33`}}>
                        <div style={{width:3,height:30,borderRadius:2,background:c.border}}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:"#f5e6c8",fontWeight:600}}>{p.producto}</div>
                          <div style={{fontSize:9,color:"#6b5a3e"}}>{c.label} · {p.uds} uds</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontSize:13,color:c.border,fontWeight:700}}>Bs {p.ingresos}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Decision text="Promover agresivamente Capuchino, Croissant y Empanada (estrellas). Eliminar Té Verde y Brownie o reformularlos — son zombies que ocupan stock sin generar ingresos." color="#f59e0b"/>
              </Card>

              {/* Cross-Selling */}
              <Card title="Índice de Afinidad — Cross-Selling" icon="🔗" accent="#10b981">
                <div style={{fontSize:10,color:"#4a3828",marginBottom:10}}>
                  FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>order_items a JOIN order_items b ON a.user_order_id=b.user_order_id AND a.product_id &lt; b.product_id</code>
                </div>
                {crossSell.map((item,i)=>(
                  <div key={i} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div style={{fontSize:12,color:"#c8a96e"}}>{item.a} <span style={{color:"#3d2f1a"}}>+</span> {item.b}</div>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{fontSize:10,color:"#6b5a3e"}}>→ "{item.combo}"</span>
                        <span style={{fontSize:13,color:"#10b981",fontWeight:700}}>{item.pct}%</span>
                      </div>
                    </div>
                    <div style={{height:4,borderRadius:2,background:"#1f160a",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${item.pct}%`,background:"linear-gradient(90deg,#10b981,#34d399)",borderRadius:2}}/>
                    </div>
                    <div style={{fontSize:10,color:"#4a3828",marginTop:2,textAlign:"right"}}>+Bs {item.bs}/día potencial</div>
                  </div>
                ))}
                <Decision text="El 72% de quienes piden Americano llevan Croissant. Crear el 'Combo Mañanero' en el POS como opción rápida — potencial +Bs 284/día extra sin esfuerzo." color="#10b981"/>
              </Card>

              {/* Sensibilidad al Precio */}
              <Card title="Tasa de Sensibilidad al Precio" icon="📊" accent="#6366f1">
                <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                  Desde <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>audit_log WHERE action='price_change'</code> cruzado con ventas diarias por producto
                </div>
                <div style={{height:190}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sensibilidad} margin={{top:4,right:0,left:-20,bottom:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f160a"/>
                      <XAxis dataKey="dia" tick={{fontSize:10,fill:"#6b5a3e"}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:9,fill:"#4a3828"}} axisLine={false} tickLine={false}/>
                      <Tooltip contentStyle={TT} formatter={(v,n)=>[`${v} uds`,n==="cap"?"Capuchino":"Empanada"]}/>
                      {/* Línea vertical marcando el cambio de precio (Miércoles) */}
                      <Line type="monotone" dataKey="cap" stroke="#6366f1" strokeWidth={2} dot={(p)=>{
                        if(p.index===2) return <circle key={p.index} cx={p.cx} cy={p.cy} r={5} fill="#ef4444" stroke="#ef4444"/>;
                        return <circle key={p.index} cx={p.cx} cy={p.cy} r={3} fill="#6366f1"/>;
                      }} name="Capuchino"/>
                      <Line type="monotone" dataKey="emp" stroke="#f59e0b" strokeWidth={2} dot={{fill:"#f59e0b",r:3}} name="Empanada"/>
                      <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10,color:"#6b5a3e"}}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <Alert2 text="🔴 Punto rojo = cambio de precio registrado en audit_log (Miércoles: Capuchino 7→9 Bs)" color="#ef4444"/>
                <Decision text="Subida de 2 Bs en Capuchino el Miércoles causó caída del -33% en ventas. Alcanzaste el límite de precio del cliente. Revertir a 7 Bs o crear versión 'premium' justificada." color="#6366f1"/>
              </Card>

              {/* Happy Hour */}
              <Card title="Oportunidades Happy Hour — Horas Muertas" icon="⏰" accent="#f59e0b">
                <div style={{fontSize:10,color:"#4a3828",marginBottom:10}}>
                  Detectadas cruzando heatmap con categorías de productos
                </div>
                {[
                  {hora:"15:00–17:00",cat:"Postres & Pastelería",  bs:"+180 Bs",color:"#ef4444",accion:"Descuento 20% o 2x1 en pastelería"},
                  {hora:"10:30–12:00",cat:"Bebidas Frías",          bs:"+120 Bs",color:"#f59e0b",accion:"Combo bebida fría + snack"},
                  {hora:"17:30–18:30",cat:"Sándwiches Fríos",       bs:"+95 Bs", color:"#6366f1",accion:"Promo 2x1 para evitar merma nocturna"},
                ].map((hh,i)=>(
                  <div key={i} style={{padding:"12px 14px",borderRadius:10,background:`${hh.color}0d`,border:`1px solid ${hh.color}22`,marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                      <div>
                        <div style={{fontSize:13,color:"#c8a96e",fontWeight:600}}>{hh.hora}</div>
                        <div style={{fontSize:11,color:"#6b5a3e"}}>{hh.cat}</div>
                      </div>
                      <div style={{fontSize:14,color:hh.color,fontWeight:700}}>{hh.bs} est.</div>
                    </div>
                    <div style={{fontSize:11,color:`${hh.color}cc`,marginTop:4}}>→ {hh.accion}</div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ══ PREDICTIVO ══ */}
          {tab==="predictivo"&&(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:14}}>

                {/* Fatiga del Cajero — SOLO con turno activo */}
                <Card title="Riesgo de Fatiga — Cajero Activo" icon="🧠" accent="#ef4444">
                  <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                    Calculado desde <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>shift_records.opened_at</code> + pagos en efectivo del turno
                  </div>
                  <Num v={`${riesgo_fatiga}%`} color="#ef4444" sub="Probabilidad de error en vuelto" size={32}/>
                  <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:7}}>
                    {[
                      {label:"Horas en turno",          v:`${fatiga_horas}h`,  warn:fatiga_horas>=4},
                      {label:"Pagos efectivo consecutivos", v:`${fatiga_pagos}`, warn:fatiga_pagos>=40},
                      {label:"Sin descanso hace",        v:`${fatiga_horas}h`,  warn:fatiga_horas>=3},
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                        <span style={{color:"#6b5a3e"}}>{r.label}</span>
                        <span style={{color:r.warn?"#ef4444":"#10b981",fontWeight:600}}>{r.v}</span>
                      </div>
                    ))}
                  </div>
                  <Decision text="Carlos M. lleva 50 pagos en efectivo seguidos (riesgo alto). Forzar arqueo rápido de verificación o dar 15 min de descanso." color="#ef4444"/>
                </Card>

                {/* Efectivo en Riesgo — SOLO con turno activo */}
                <Card title="Proyección de Efectivo en Caja" icon="💵" accent="#10b981">
                  <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                    <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>initial_fund + SUM(op.amount WHERE method='cash')</code> del turno activo
                  </div>
                  <Num v={`Bs ${efectivoCaja.acumulado.toLocaleString()}`} color="#10b981" sub="Efectivo físico estimado en caja" size={26}/>
                  <div style={{marginTop:12}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:5}}>
                      <span style={{color:"#6b5a3e"}}>Umbral configurado</span>
                      <span style={{color:"#f59e0b",fontSize:10}}>Bs {efectivoCaja.umbral.toLocaleString()} · <code style={{fontSize:9}}>global_settings[cash_discrepancy_threshold]</code></span>
                    </div>
                    <div style={{height:7,borderRadius:4,background:"#1f160a",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${efectivoCaja.pct}%`,background:"linear-gradient(90deg,#10b981,#f59e0b,#ef4444)",borderRadius:4}}/>
                    </div>
                    <div style={{fontSize:10,color:"#4a3828",marginTop:3,textAlign:"right"}}>{efectivoCaja.pct}% del límite</div>
                  </div>
                  <Decision text="La caja superará el umbral en ~12 min. Programar sangría de efectivo para las 14:15 antes de que ocurra." color="#10b981"/>
                </Card>

                {/* Congestión Pronosticada */}
                <Card title="Pronóstico de Congestión en Caja" icon="⚡" accent="#6366f1">
                  <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                    Promedio histórico por día de semana · disponible también sin turno activo
                  </div>
                  <div style={{height:140}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={congestion} margin={{top:0,right:0,left:-20,bottom:0}}>
                        <XAxis dataKey="hora" tick={{fontSize:9,fill:"#6b5a3e"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:8,fill:"#4a3828"}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={TT} formatter={v=>[`${v} tickets/h`,""]}/>
                        <Bar dataKey="t" radius={[3,3,0,0]}>
                          {congestion.map((e,i)=><Cell key={i} fill={e.t>=45?"#ef4444":e.t>=35?"#f59e0b":"#6366f1"}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <Decision text="Mañana habrá congestión crítica 10:00–11:00 (52 tickets/h). Asignar un segundo cajero de apoyo para ese bloque." color="#6366f1"/>
                </Card>
              </div>

              {/* Mermas + Transición de Categorías */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <Card title="Pronóstico de Mermas del Turno" icon="🗑️" accent="#ef4444">
                  <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                    FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>stock_movements WHERE movement_type='shrinkage' AND today</code> + proyección histórica
                  </div>
                  {mermas.map((m,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",borderRadius:8,marginBottom:7,
                      background:m.urgencia==="alta"?"rgba(239,68,68,0.08)":m.urgencia==="media"?"rgba(245,158,11,0.08)":"rgba(16,185,129,0.08)",
                      border:`1px solid ${m.urgencia==="alta"?"rgba(239,68,68,0.2)":m.urgencia==="media"?"rgba(245,158,11,0.2)":"rgba(16,185,129,0.2)"}`}}>
                      <div>
                        <div style={{fontSize:12,color:"#c8a96e",fontWeight:600}}>{m.prod}</div>
                        <div style={{fontSize:10,color:"#6b5a3e"}}>~{m.uds} uds en riesgo</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:13,color:"#ef4444",fontWeight:700}}>–Bs {m.bs}</div>
                        <div style={{fontSize:10,color:m.urgencia==="alta"?"#fca5a5":m.urgencia==="media"?"#fde68a":"#6ee7b7"}}>
                          {m.urgencia==="alta"?"🔴 Actuar ahora":m.urgencia==="media"?"🟡 Monitorear":"🟢 OK"}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Decision text="Se proyectan 15 Sándwiches Fríos perdidos esta tarde (–Bs 135). Lanzar promo 2x1 a las 17:00 para venderlos antes del cierre." color="#ef4444"/>
                </Card>

                <Card title="Predicción de Transición de Categorías" icon="📈" accent="#10b981">
                  <div style={{fontSize:10,color:"#4a3828",marginBottom:8}}>
                    FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>order_items JOIN categories GROUP BY day</code> · últimos 7 días
                  </div>
                  <div style={{height:170}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={tendenciaCat} margin={{top:4,right:0,left:-20,bottom:0}}>
                        <defs>
                          <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ef4444" stopOpacity={0.4}/><stop offset="100%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                          <linearGradient id="gF2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f160a"/>
                        <XAxis dataKey="dia" tick={{fontSize:10,fill:"#6b5a3e"}} axisLine={false} tickLine={false}/>
                        <YAxis tick={{fontSize:9,fill:"#4a3828"}} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={TT}/>
                        <Area type="monotone" dataKey="calientes" name="Bebidas Calientes" stroke="#ef4444" fill="url(#gC2)" strokeWidth={2}/>
                        <Area type="monotone" dataKey="frias" name="Bebidas Frías" stroke="#10b981" fill="url(#gF2)" strokeWidth={2}/>
                        <Legend iconType="circle" iconSize={7} wrapperStyle={{fontSize:10,color:"#6b5a3e"}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <Decision text="Bebidas Frías superarán a Calientes este fin de semana. Reorganizar la vitrina y publicidad visual de la tienda antes del sábado." color="#10b981"/>
                </Card>
              </div>

              {/* Comparativa completa de cajeros — vista exclusiva del Admin */}
              <Card title="Comparativa de Eficiencia — Todos los Cajeros (Mes Actual)" icon="👥" accent="#6366f1" full>
                <div style={{fontSize:10,color:"#4a3828",marginBottom:12}}>
                  Vista exclusiva del Administrador · Score = (ventas_turno / expected_amount × 100) − (ABS(discrepancy) / expected_amount × 100) · FROM <code style={{fontSize:9,background:"#1f160a",padding:"1px 4px",borderRadius:3}}>shift_records WHERE status='closed'</code>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
                  {cajeros.map((c,i)=>(
                    <div key={i} style={{padding:"16px 18px",borderRadius:12,background:"rgba(99,102,241,0.06)",border:`1px solid ${c.score>=85?"rgba(16,185,129,0.25)":c.score>=70?"rgba(245,158,11,0.25)":"rgba(239,68,68,0.25)"}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                        <div>
                          <div style={{fontSize:13,color:"#c8a96e",fontWeight:600}}>{c.nombre}</div>
                          <div style={{fontSize:10,color:"#6b5a3e"}}>{c.turnos} turnos este mes</div>
                        </div>
                        <div style={{textAlign:"right"}}>
                          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,lineHeight:1,color:c.score>=85?"#10b981":c.score>=70?"#f59e0b":"#ef4444"}}>{c.score}%</div>
                          <div style={{fontSize:9,color:"#6b5a3e"}}>eficiencia</div>
                        </div>
                      </div>
                      <div style={{height:90}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={RADAR_KEYS.map((k,j)=>({subject:k,v:c.radar[j]}))} outerRadius={34}>
                            <PolarGrid stroke="#2a1f0f"/>
                            <PolarAngleAxis dataKey="subject" tick={{fontSize:7,fill:"#6b5a3e"}}/>
                            <Radar dataKey="v" stroke="#6366f1" fill="#6366f1" fillOpacity={0.22}/>
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8,fontSize:11}}>
                        <div><span style={{color:"#6b5a3e"}}>Ventas: </span><span style={{color:"#f5e6c8",fontWeight:600}}>Bs {c.ventas.toLocaleString()}</span></div>
                        <div><span style={{color:"#6b5a3e"}}>Descuadre: </span><span style={{color:Math.abs(c.discrepancia)>50?"#ef4444":"#10b981",fontWeight:600}}>Bs {c.discrepancia}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
                <Decision text="Carlos M. (94.1%) es tu empleado más valioso: vende más y cobra perfecto. Daniela R. (71.3%) tiene descuadres sistemáticos altos (–Bs 185) — requiere seguimiento o capacitación en manejo de efectivo." color="#6366f1"/>
              </Card>
            </>
          )}

          <div style={{marginTop:24,paddingTop:12,borderTop:"1px solid #1a1208",display:"flex",justifyContent:"space-between"}}>
            <div style={{fontSize:10,color:"#3d2f1a"}}>TPS Cafetería Comercial · UCB Semestre 1-2026 · Sistemas de Soporte a las Decisiones · Vista: Administrador</div>
            <div style={{fontSize:10,color:"#3d2f1a"}}>⟳ {ahora.toLocaleTimeString("es-BO")} · Datos simulados sobre esquema real PostgreSQL</div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0e0a04}::-webkit-scrollbar-thumb{background:#3d2f1a;border-radius:2px}
        button:hover{opacity:0.85}
        code{font-family:'Courier New',monospace;color:#6b5a3e}
      `}</style>
    </div>
  );
}