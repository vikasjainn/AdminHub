import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: { extend: { colors: { brand: { 50:'#EEF2FF',100:'#E0E7FF',200:'#C7D2FE',300:'#A5B4FC',400:'#818CF8',500:'#6366F1',600:'#4F46E5',700:'#4338CA',800:'#3730A3',900:'#312E81' }, slate: {50:'#F8FAFC',100:'#F1F5F9',200:'#E2E8F0',300:'#CBD5E1',400:'#94A3B8',500:'#64748B',600:'#475569',700:'#334155',800:'#1E293B',900:'#0F172A'} }, boxShadow:{card:'0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)'} } },
  plugins: []
};
export default config;
