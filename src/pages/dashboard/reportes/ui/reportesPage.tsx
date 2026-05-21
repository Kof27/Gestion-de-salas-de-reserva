"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/src/widgets/navbar/ui/Navbar";
import { Sidebar } from "@/src/widgets/sidebar/ui/Sidebar";
import { useReporteReservas } from "../hook/useReporteReservas";
import { useReporteHoras } from "../hook/useReporteHoras";
import { useReporteUsuarios } from "../hook/useReporteUsuarios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Calendar, Loader2, AlertCircle, Filter, TrendingUp, FileBarChart, Inbox, Download, Clock, Timer, Users, UserCheck, Activity, Search, ArrowLeft, MapPin, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";

type ReportType = "reservas" | "horas" | "usuario";

interface ReportTab {
  id: ReportType;
  label: string;
  description: string;
}

const reportTabs: ReportTab[] = [
  {
    id: "reservas",
    label: "Reporte de uso por número de reservas",
    description: "Análisis del número de reservas por sala",
  },
  {
    id: "horas",
    label: "Reporte de uso por horas reservadas",
    description: "Total de horas reservadas por sala",
  },
  {
    id: "usuario",
    label: "Reporte de uso por usuario",
    description: "Reservas agrupadas por usuario",
  },
];

export function ReportesPage() {
  const [activeTab, setActiveTab] = useState<ReportType>("reservas");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Reportes</h1>
              <p className="mt-1 text-sm text-gray-500">
                Analiza el uso de salas y reservas en la institución
              </p>
            </div>

            {/* Menú horizontal de reportes */}
            <div className="mb-6 overflow-x-auto sm:mb-8">
              <div className="flex gap-2 border-b border-gray-200 min-w-max">
                {reportTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2 sm:px-4 sm:text-sm ${activeTab === tab.id
                      ? "border-red-500 text-red-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contenido del reporte */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:p-8">
              {activeTab === "reservas" && <ReporteReservas />}
              {activeTab === "horas" && <ReporteHoras />}
              {activeTab === "usuario" && <ReporteUsuario />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const PIE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"];

function ReporteReservas() {
  const {
    loading,
    error,
    pendingStartDate,
    setPendingStartDate,
    pendingEndDate,
    setPendingEndDate,
    pendingReservationCount,
    setPendingReservationCount,
    appliedReservationCount,
    appliedStartDate,
    appliedEndDate,
    validationError,
    applyFilter,
    reportData,
    timelineData,
    stats,
    loadData,
  } = useReporteReservas();

  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatRange = () => {
    const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
    return `${appliedStartDate.toLocaleDateString("es-CO", opts)} — ${appliedEndDate.toLocaleDateString("es-CO", opts)}`;
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setDownloading(true);

      const node = reportRef.current;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      // Cargar la imagen para obtener dimensiones reales
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `reporte-reservas-${appliedStartDate.toISOString().split("T")[0]}_${appliedEndDate.toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600 text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  const hasData = reportData.length > 0;

  return (
    <div className="space-y-6">

      {/* Filtro de fechas y número de reservas */}
      <div className="bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-700">
            Filtrar reporte
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
              Fecha Inicio
            </label>
            <div
              className={`flex items-center gap-2 bg-white rounded-lg border transition-colors px-3 py-2.5 ${validationError.startDate || validationError.range
                ? "border-red-300 ring-1 ring-red-200"
                : "border-slate-200 hover:border-slate-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                }`}
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={pendingStartDate}
                onChange={(e) => setPendingStartDate(e.target.value)}
                className="outline-none text-sm text-slate-700 bg-transparent w-full"
              />
            </div>
            {validationError.startDate && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError.startDate}
              </p>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
              Fecha Fin
            </label>
            <div
              className={`flex items-center gap-2 bg-white rounded-lg border transition-colors px-3 py-2.5 ${validationError.endDate || validationError.range
                ? "border-red-300 ring-1 ring-red-200"
                : "border-slate-200 hover:border-slate-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                }`}
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={pendingEndDate}
                onChange={(e) => setPendingEndDate(e.target.value)}
                className="outline-none text-sm text-slate-700 bg-transparent w-full"
              />
            </div>
            {validationError.endDate && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError.endDate}
              </p>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
              Número de reservas
            </label>
            <div
              className={`flex items-center gap-2 bg-white rounded-lg border transition-colors px-3 py-2.5 ${validationError.reservationCount
                ? "border-red-300 ring-1 ring-red-200"
                : "border-slate-200 hover:border-slate-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                }`}
            >
              <FileBarChart className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={3}
                placeholder="Ej: 3"
                value={pendingReservationCount}
                onChange={(e) => setPendingReservationCount(e.target.value)}
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "Tab",
                    "ArrowLeft",
                    "ArrowRight",
                    "Home",
                    "End",
                  ];

                  if (allowedKeys.includes(e.key)) return;

                  if (!/^\d$/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const pastedText = e.clipboardData.getData("text");

                  if (!/^\d+$/.test(pastedText)) {
                    e.preventDefault();
                  }
                }}
                className="outline-none text-sm text-slate-700 bg-transparent w-full placeholder-slate-400"
              />
            </div>
            {validationError.reservationCount && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError.reservationCount}
              </p>
            )}
          </div>

          <button
            onClick={applyFilter}
            className="h-10.5 w-full sm:w-auto px-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Filter className="h-4 w-4" />
            Aplicar Filtro
          </button>
        </div>

        {validationError.range && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {validationError.range}
          </div>
        )}
      </div>

      {/* Contenido descargable */}
      <div ref={reportRef} className="space-y-4 bg-white p-3 rounded-xl sm:space-y-6 sm:p-4">
        {/* Header del reporte */}
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Reporte de uso por número de reservas
            </h2>
            <div className="space-y-1 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>
                  Período:{" "}
                  <span className="font-semibold text-gray-800">{formatRange()}</span>
                </span>
              </div>

              {appliedReservationCount !== "" && (
                <div className="flex items-center gap-2">
                  <FileBarChart className="h-4 w-4 text-gray-400" />
                  <span>
                    Número de reservas:{" "}
                    <span className="font-semibold text-gray-800">
                      {appliedReservationCount}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right text-xs text-gray-500">
            <p>Generado el</p>
            <p className="font-medium text-gray-700">
              {new Date().toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FileBarChart className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Total Reservas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.totalReservas}</p>
            <p className="text-xs text-gray-500 mt-1">en {stats.daysInRange} días</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Inbox className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Salas Utilizadas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.totalSalas}</p>
            <p className="text-xs text-gray-500 mt-1">salas con actividad</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Promedio Diario</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.promedioDiario}</p>
            <p className="text-xs text-gray-500 mt-1">reservas / día</p>
          </div>

          <div className="bg-linear-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-sm text-white sm:p-5">
            <div className="flex items-center gap-2 text-red-100 mb-2">
              <FileBarChart className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Top Sala</p>
            </div>
            <p className="text-lg font-bold truncate">
              {stats.salaConMasReservas || "Sin datos"}
            </p>
            <p className="text-xs text-red-100 mt-1">{stats.maxReservas} reservas</p>
          </div>
        </div>

        {/* Sin datos */}
        {!hasData ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-12 text-center">
            <Inbox className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-amber-900 mb-1">No existen reservas</h3>
            <p className="text-sm text-amber-700">
              {appliedReservationCount !== ""
                ? `No hay salas con exactamente ${appliedReservationCount} reservas en el rango de fechas seleccionado.`
                : "No hay reservas registradas en el rango de fechas seleccionado. Intenta con otro período."}
            </p>
          </div>
        ) : (
          <>
            {/* Gráficos: Barras + Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Gráfico de barras */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Reservas por Sala
                </h3>
                <p className="text-xs text-gray-500 mb-4">Comparativa de uso de cada sala</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="salaNombre"
                      angle={-30}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value} reservas`, "Total"]}
                    />
                    <Bar dataKey="totalReservas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de dona (Pie) */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Distribución Porcentual
                </h3>
                <p className="text-xs text-gray-500 mb-4">% de uso por sala</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData}
                      dataKey="totalReservas"
                      nameKey="salaNombre"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {reportData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                      formatter={(value, name) => [`${value} reservas`, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de línea: Evolución temporal por sala */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Evolución de Reservas en el Tiempo
              </h3>
              <p className="text-xs text-gray-500 mb-4">Reservas diarias por sala durante el período</p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={timelineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [`${value} reservas`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="line"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                  {reportData.map((sala, idx) => (
                    <Line
                      key={sala.salaId}
                      type="monotone"
                      dataKey={sala.salaNombre}
                      stroke={PIE_COLORS[idx % PIE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: PIE_COLORS[idx % PIE_COLORS.length], r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla detallada */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-200 sm:px-5">
                <h3 className="text-sm font-semibold text-gray-900">Detalle por Sala</h3>
                <p className="text-xs text-gray-500 mt-0.5">Listado completo del período seleccionado</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-120">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Sala
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Reservas
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Porcentaje
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5 text-sm text-gray-900 font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                            ></div>
                            {item.salaNombre}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                          {item.totalReservas}
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm text-gray-600">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                                }}
                              ></div>
                            </div>
                            <span className="w-10 text-right font-medium">{item.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botón de descarga PDF */}
      {hasData && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm shadow-sm sm:w-auto"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Descargar Reporte PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function ReporteHoras() {
  const {
    loading,
    error,
    pendingStartDate,
    setPendingStartDate,
    pendingEndDate,
    setPendingEndDate,
    appliedStartDate,
    appliedEndDate,
    validationError,
    applyFilter,
    reportData,
    timelineData,
    stats,
    loadData,
  } = useReporteHoras();

  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatRange = () => {
    const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", year: "numeric" };
    return `${appliedStartDate.toLocaleDateString("es-CO", opts)} — ${appliedEndDate.toLocaleDateString("es-CO", opts)}`;
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setDownloading(true);
      const node = reportRef.current;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `reporte-horas-${appliedStartDate.toISOString().split("T")[0]}_${appliedEndDate.toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600 text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  const hasData = reportData.length > 0;

  return (
    <div className="space-y-6">
      {/* Filtro de fechas estilizado */}
      <div className="bg-linear-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-700">Filtrar por rango de fechas</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
              Fecha Inicio
            </label>
            <div
              className={`flex items-center gap-2 bg-white rounded-lg border transition-colors px-3 py-2.5 ${validationError.startDate || validationError.range
                ? "border-red-300 ring-1 ring-red-200"
                : "border-slate-200 hover:border-slate-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                }`}
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={pendingStartDate}
                onChange={(e) => setPendingStartDate(e.target.value)}
                className="outline-none text-sm text-slate-700 bg-transparent w-full"
              />
            </div>
            {validationError.startDate && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError.startDate}
              </p>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5 uppercase tracking-wide">
              Fecha Fin
            </label>
            <div
              className={`flex items-center gap-2 bg-white rounded-lg border transition-colors px-3 py-2.5 ${validationError.endDate || validationError.range
                ? "border-red-300 ring-1 ring-red-200"
                : "border-slate-200 hover:border-slate-300 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100"
                }`}
            >
              <Calendar className="h-4 w-4 text-slate-400" />
              <input
                type="date"
                value={pendingEndDate}
                onChange={(e) => setPendingEndDate(e.target.value)}
                className="outline-none text-sm text-slate-700 bg-transparent w-full"
              />
            </div>
            {validationError.endDate && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {validationError.endDate}
              </p>
            )}
          </div>

          <button
            onClick={applyFilter}
            className="h-10.5 w-full sm:w-auto px-6 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <Filter className="h-4 w-4" />
            Aplicar Filtro
          </button>
        </div>

        {validationError.range && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {validationError.range}
          </div>
        )}
      </div>

      {/* Contenido descargable */}
      <div ref={reportRef} className="space-y-4 bg-white p-3 rounded-xl sm:space-y-6 sm:p-4">
        {/* Header del reporte */}
        <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Reporte de uso por horas reservadas
            </h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 sm:text-sm">
              <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
              <span>
                Período: <span className="font-semibold text-gray-800">{formatRange()}</span>
              </span>
            </div>
          </div>
          <div className="text-left text-xs text-gray-500 sm:text-right">
            <p>Generado el</p>
            <p className="font-medium text-gray-700">
              {new Date().toLocaleDateString("es-CO", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Total Horas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.totalHoras}h</p>
            <p className="text-xs text-gray-500 mt-1">en {stats.daysInRange} días</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Inbox className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Salas Utilizadas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.totalSalas}</p>
            <p className="text-xs text-gray-500 mt-1">salas con actividad</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Timer className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Prom. por Reserva</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{stats.promedioPorReserva}h</p>
            <p className="text-xs text-gray-500 mt-1">duración media</p>
          </div>

          <div className="bg-linear-to-br from-red-500 to-red-600 rounded-xl p-4 shadow-sm text-white sm:p-5">
            <div className="flex items-center gap-2 text-red-100 mb-2">
              <TrendingUp className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">Top Sala</p>
            </div>
            <p className="text-lg font-bold truncate">
              {stats.salaConMasHoras || "Sin datos"}
            </p>
            <p className="text-xs text-red-100 mt-1">{stats.maxHoras}h reservadas</p>
          </div>
        </div>

        {/* Sin datos */}
        {!hasData ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-12 text-center">
            <Inbox className="h-12 w-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-amber-900 mb-1">No existen reservas</h3>
            <p className="text-sm text-amber-700">
              No hay reservas registradas en el rango de fechas seleccionado. Intenta con otro período.
            </p>
          </div>
        ) : (
          <>
            {/* Gráficos: Barras + Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Horas Reservadas por Sala
                </h3>
                <p className="text-xs text-gray-500 mb-4">Comparativa de tiempo usado en cada sala</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData} margin={{ top: 5, right: 10, left: -20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="salaNombre"
                      angle={-30}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(value) => `${value}h`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`${value} horas`, "Total"]}
                    />
                    <Bar dataKey="totalHoras" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Distribución Porcentual
                </h3>
                <p className="text-xs text-gray-500 mb-4">% del tiempo total por sala</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData}
                      dataKey="totalHoras"
                      nameKey="salaNombre"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {reportData.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "12px",
                      }}
                      formatter={(value, name) => [`${value} horas`, name]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de línea: Evolución temporal por sala */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Evolución de Horas en el Tiempo
              </h3>
              <p className="text-xs text-gray-500 mb-4">Horas reservadas por sala durante el período</p>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={timelineData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(value) => `${value}h`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) => [`${value} horas`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="line"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                  {reportData.map((sala, idx) => (
                    <Line
                      key={sala.salaId}
                      type="monotone"
                      dataKey={sala.salaNombre}
                      stroke={PIE_COLORS[idx % PIE_COLORS.length]}
                      strokeWidth={2}
                      dot={{ fill: PIE_COLORS[idx % PIE_COLORS.length], r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla detallada */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-200 sm:px-5">
                <h3 className="text-sm font-semibold text-gray-900">Detalle por Sala</h3>
                <p className="text-xs text-gray-500 mt-0.5">Listado completo del período seleccionado</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-160">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Sala
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Horas
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Reservas
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Prom. / Reserva
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Porcentaje
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3.5 text-sm text-gray-900 font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                            ></div>
                            {item.salaNombre}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm font-semibold text-gray-900">
                          {item.totalHoras}h
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm text-gray-600">
                          {item.totalReservas}
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm text-gray-600">
                          {item.promedioPorReserva}h
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm text-gray-600">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${item.percentage}%`,
                                  backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                                }}
                              ></div>
                            </div>
                            <span className="w-10 text-right font-medium">{item.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botón de descarga PDF */}
      {hasData && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm shadow-sm sm:w-auto"
          >
            {downloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generando PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Descargar Reporte PDF
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}


function ReporteUsuario() {
  const {
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredUserList,
    selectedUserDetail,
    selectUser,
    clearSelection,
    loadData,
  } = useReporteUsuarios();

  const reportRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || !selectedUserDetail) return;
    try {
      setDownloading(true);
      const node = reportRef.current;
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (img.height * imgWidth) / img.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const safeName = selectedUserDetail.nombre.replace(/\s+/g, "_").toLowerCase();
      pdf.save(`reporte-usuario-${safeName}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-600 text-sm flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  // ============================================================
  // VISTA 2: DETALLE DEL USUARIO
  // ============================================================
  if (selectedUserDetail) {
    const initials = selectedUserDetail.nombre
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("");

    return (
      <div className="space-y-6">
        {/* Botón volver */}
        <button
          onClick={clearSelection}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          Volver al listado de usuarios
        </button>

        {/* Contenido descargable */}
        <div ref={reportRef} className="space-y-4 bg-white p-3 rounded-xl sm:space-y-6 sm:p-4">
          {/* Header del usuario */}
          <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0 sm:w-14 sm:h-14 sm:text-lg">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate sm:text-xl">
                  {selectedUserDetail.nombre}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate sm:text-sm">
                  {selectedUserDetail.correo}
                </p>
              </div>
            </div>
            <div className="text-left text-xs text-gray-500 sm:text-right">
              <p>Generado el</p>
              <p className="font-medium text-gray-700">
                {new Date().toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FileBarChart className="h-4 w-4" />
                <p className="text-xs font-medium uppercase tracking-wide">Total Reservas</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {selectedUserDetail.totalReservas}
              </p>
              <p className="text-xs text-gray-500 mt-1">en el historial</p>
            </div>

            <div className="bg-white rounded-xl border border-green-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <p className="text-xs font-medium uppercase tracking-wide">Realizadas</p>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {selectedUserDetail.reservasRealizadas}
              </p>
              <p className="text-xs text-gray-500 mt-1">reservas completadas</p>
            </div>

            <div className="bg-white rounded-xl border border-red-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <XCircle className="h-4 w-4" />
                <p className="text-xs font-medium uppercase tracking-wide">Canceladas</p>
              </div>
              <p className="text-3xl font-bold text-red-700">
                {selectedUserDetail.reservasCanceladas}
              </p>
              <p className="text-xs text-gray-500 mt-1">reservas anuladas</p>
            </div>
          </div>

          {/* Gráficas analíticas */}
          {selectedUserDetail.reservas.length > 0 && (
            <>
              {/* Fila 1: Estado + Top Salas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Pie chart - Estado de reservas */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Estado de Reservas
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Distribución entre realizadas y canceladas
                  </p>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={selectedUserDetail.estadoChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                        label={({ name, percent }) =>
                          `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {selectedUserDetail.estadoChart.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                        }}
                        formatter={(value, name) => [`${value} reservas`, name]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={32}
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar chart - Top salas */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Salas Más Reservadas
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Top 5 espacios preferidos por el usuario
                  </p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={selectedUserDetail.salasChart}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        allowDecimals={false}
                      />
                      <YAxis
                        dataKey="salaNombre"
                        type="category"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        width={130}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [`${value} reservas`, "Total"]}
                      />
                      <Bar dataKey="total" fill="#ef4444" radius={[0, 6, 6, 0]}>
                        {selectedUserDetail.salasChart.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fila 2: Día de semana + Evolución mensual */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Reservas por día de la semana */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Patrón Semanal
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Reservas distribuidas por día de la semana
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={selectedUserDetail.diaSemanaChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="dia"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                        }}
                        formatter={(value) => [`${value} reservas`, "Total"]}
                      />
                      <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Evolución mensual */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sm:p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    Evolución Mensual
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Reservas realizadas vs canceladas por mes
                  </p>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={selectedUserDetail.mesChart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="mes"
                        tick={{ fontSize: 11, fill: "#64748b" }}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#64748b" }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "12px",
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={28}
                        iconType="circle"
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                      <Bar dataKey="realizadas" name="Realizadas" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="canceladas" name="Canceladas" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Tabla de reservas */}
          {selectedUserDetail.reservas.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-12 text-center">
              <Inbox className="h-12 w-12 text-amber-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-amber-900 mb-1">
                Sin reservas registradas
              </h3>
              <p className="text-sm text-amber-700">
                Este usuario aún no ha realizado ninguna reserva.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-4 border-b border-gray-200 sm:px-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Historial de Reservas
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Listado ordenado por fecha (más recientes primero)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-180">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Sala
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Ubicación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Horario
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sm:px-6">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserDetail.reservas.map((r) => (
                      <tr
                        key={r.id_reserva}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3.5 text-sm text-gray-900 font-medium">
                          {r.salaNombre}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                            {r.salaUbicacion}
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          {r.fecha}
                        </td>
                        <td className="px-6 py-3.5 text-sm text-gray-600">
                          {r.horaInicio} — {r.horaFin}
                        </td>
                        <td className="px-6 py-3.5 text-sm">
                          {r.estado === "realizada" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Realizada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              <XCircle className="h-3 w-3" />
                              Cancelada
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Botón de descarga PDF */}
        {selectedUserDetail.reservas.length > 0 && (
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex w-full items-center justify-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm shadow-sm sm:w-auto"
            >
              {downloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Descargar Reporte PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // VISTA 1: LISTADO DE USUARIOS DE LA FACULTAD
  // ============================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Usuarios de la Facultad
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona un usuario para ver su reporte detallado de reservas
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-colors">
        <Search className="h-4 w-4 text-gray-400 shrink-0" />
        <input
          type="text"
          placeholder="Buscar usuario por nombre o correo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="outline-none text-sm text-gray-700 bg-transparent w-full placeholder-gray-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-gray-400 hover:text-gray-600 text-xs"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Lista de usuarios */}
      {filteredUserList.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-12 text-center">
          <Inbox className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-amber-900 mb-1">
            No se encontraron usuarios
          </h3>
          <p className="text-sm text-amber-700">
            {searchQuery
              ? `No hay usuarios que coincidan con "${searchQuery}"`
              : "No hay usuarios registrados en tu facultad"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5 sm:py-4">
            <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
              {filteredUserList.length} {filteredUserList.length === 1 ? "usuario" : "usuarios"}
            </h3>
            <p className="text-xs text-gray-500">
              Ordenados por mayor número de reservas
            </p>
          </div>
          <ul>
            {filteredUserList.map((u, idx) => {
              const initials = u.nombre
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? "")
                .join("");

              return (
                <li
                  key={u.id_usuario}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => selectUser(u.id_usuario)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors group sm:gap-4 sm:px-5 sm:py-4"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 sm:w-11 sm:h-11"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    >
                      {initials || "US"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {u.nombre}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {u.correo}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 sm:gap-6">
                      <div className="text-right">
                        <p className="hidden text-xs font-medium text-gray-500 uppercase tracking-wide sm:block">
                          Total
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {u.totalReservas}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span className="font-medium">{u.reservasRealizadas}</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-600">
                          <XCircle className="h-3.5 w-3.5" />
                          <span className="font-medium">{u.reservasCanceladas}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ReportesPage;
