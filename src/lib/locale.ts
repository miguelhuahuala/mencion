/**
 * Países e idiomas de medición. Cada consulta simula a una persona en el país elegido:
 * - ChatGPT: ubicación real del LLM Scraper (location_code de DataForSEO).
 * - Claude, Gemini y Perplexity: mensaje de sistema con país e idioma (la API de DataForSEO no acepta
 *   todos los países como ubicación de búsqueda; Perú, por ejemplo, no está en la lista de Claude).
 */
export const COUNTRIES: { code: string; name: string; nameEn: string; namePt: string }[] = [
  { code: "PE", name: "Perú", nameEn: "Peru", namePt: "Peru" },
  { code: "MX", name: "México", nameEn: "Mexico", namePt: "México" },
  { code: "CO", name: "Colombia", nameEn: "Colombia", namePt: "Colômbia" },
  { code: "CL", name: "Chile", nameEn: "Chile", namePt: "Chile" },
  { code: "AR", name: "Argentina", nameEn: "Argentina", namePt: "Argentina" },
  { code: "EC", name: "Ecuador", nameEn: "Ecuador", namePt: "Equador" },
  { code: "ES", name: "España", nameEn: "Spain", namePt: "Espanha" },
  { code: "US", name: "Estados Unidos", nameEn: "the United States", namePt: "Estados Unidos" },
  { code: "BR", name: "Brasil", nameEn: "Brazil", namePt: "Brasil" },
];

export const countryName = (code: string) => COUNTRIES.find((c) => c.code === code.toUpperCase())?.name ?? code;

/** Mensaje de sistema que ubica la consulta en el país e idioma del proyecto (máx. 500 caracteres, límite de DataForSEO). */
export function locationContext(countryCode: string, language: string) {
  const c = COUNTRIES.find((x) => x.code === countryCode.toUpperCase());
  if (!c) return undefined;
  if (language.startsWith("en")) {
    return `The user is located in ${c.nameEn} and writes in English. Answer as you would for someone in ${c.nameEn}: recommend brands, products, services and sources that are available there.`;
  }
  if (language.startsWith("pt")) {
    return `O usuário está em ${c.namePt} e escreve em português. Responda como responderia a alguém em ${c.namePt}: recomende marcas, produtos, serviços e fontes disponíveis lá.`;
  }
  return `El usuario se encuentra en ${c.name} y escribe en español. Responde como lo harías para alguien en ${c.name}: recomienda marcas, productos, servicios y fuentes disponibles allí.`;
}
