export interface Settings {
  baseURL: string;
  apiKey: string;
  model: string;
  profile: string;
  query: string;
  location: string;
  infojobsClientId: string;
  infojobsClientSecret: string;
}

export const defaultSettings: Settings = {
  baseURL: "",
  apiKey: "",
  model: "",
  profile:
    "Desarrollador web full stack junior, en Totana (Murcia, España). " +
    "Stack: JavaScript, TypeScript, React, Next.js, Astro, Tailwind, Bootstrap, Node.js, Express, MySQL, MongoDB, Git. " +
    "Formación: bootcamp Full-Stack en HACK A BOSS (2022-2023) + especialización autodidacta (Next.js, TypeScript, Shadcn, MaterialUI). " +
    "Experiencia: desarrollo web desde 2023 con proyectos propios (APIs REST, SSR, despliegues, testing básico). " +
    "Inglés básico. Carnet de conducir y vehículo propio. " +
    "Busco: puestos junior full stack, frontend o backend con stack JavaScript/TypeScript, preferiblemente remoto o en la Región de Murcia. " +
    "Descartar: ofertas que exijan +3 años de experiencia, roles senior, o stacks ajenos (Java, .NET, PHP, SAP, COBOL).",
  query: "desarrollador full stack junior",
  // ponytail: LinkedIn no reconoce "España" (con ñ) como geo → usar Madrid/Spain
  location: "Murcia",
  infojobsClientId: "",
  infojobsClientSecret: "",
};
