import { prisma } from "../lib/prisma.js";
import { Roast, Process } from "@prisma/client";

async function main() {
  console.log("☕ Insertando catálogo de 20 variedades...");

  const coffeeData = [
    {
      name: "Etiopía Yirgacheffe",
      slug: "etiopia-yirgacheffe",
      origin: "Etiopía",
      region: "Yirgacheffe",
      description: "Notas florales a jazmín y cítricos brillantes.",
      roastLevel: Roast.LIGHT,
      process: Process.WASHED,
      variants: {
        create: [
          { weight: 250, price: 14.5, stock: 45 },
          { weight: 500, price: 27.0, stock: 20 },
        ],
      },
    },
    {
      name: "Colombia Huila Reserva",
      slug: "colombia-huila-reserva",
      origin: "Colombia",
      region: "Huila",
      description: "Dulce y equilibrado con notas de caramelo y chocolate.",
      roastLevel: Roast.MEDIUM,
      process: Process.WASHED,
      variants: {
        create: [
          { weight: 250, price: 12.9, stock: 100 },
          { weight: 1000, price: 42.0, stock: 15 },
        ],
      },
    },
    {
      name: "Brasil Bourbon Amarillo",
      slug: "brasil-bourbon-amarillo",
      origin: "Brasil",
      region: "Sul de Minas",
      description: "Cuerpo denso, baja acidez y notas de frutos secos.",
      roastLevel: Roast.MEDIUM,
      process: Process.NATURAL,
      variants: {
        create: [{ weight: 500, price: 19.5, stock: 60 }],
      },
    },
    {
      name: "Kenia AA Gatomboya",
      slug: "kenia-aa-gatomboya",
      origin: "Kenia",
      region: "Gatomboya",
      description: "Explosión de sabor a grosella negra y acidez brillante.",
      roastLevel: Roast.LIGHT,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 16.8, stock: 30 }],
      },
    },
    {
      name: "Guatemala Huehuetenango",
      slug: "guatemala-huehuetenango",
      origin: "Guatemala",
      region: "Huehuetenango",
      description: "Complejo con notas de chocolate con leche y manzana verde.",
      roastLevel: Roast.MEDIUM,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 13.5, stock: 80 }],
      },
    },
    {
      name: "Costa Rica Tarrazú Honey",
      slug: "costa-rica-tarrazu-honey",
      origin: "Costa Rica",
      region: "Tarrazú",
      description: "Dulzura de miel y melaza con textura sedosa.",
      roastLevel: Roast.MEDIUM,
      process: Process.HONEY,
      variants: {
        create: [{ weight: 250, price: 15.2, stock: 50 }],
      },
    },
    {
      name: "Sumatra Mandheling",
      slug: "sumatra-mandheling",
      origin: "Indonesia",
      region: "Sumatra",
      description: "Perfil terroso, especiado, con notas de tabaco.",
      roastLevel: Roast.DARK,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 1000, price: 38.0, stock: 10 }],
      },
    },
    {
      name: "Panamá Geisha Estate",
      slug: "panama-geisha-estate",
      origin: "Panamá",
      region: "Boquete",
      description: "Exclusivo, con notas intensas a bergamota y rosas.",
      roastLevel: Roast.LIGHT,
      process: Process.NATURAL,
      variants: {
        create: [{ weight: 250, price: 45.0, stock: 5 }],
      },
    },
    {
      name: "México Chiapas Orgánico",
      slug: "mexico-chiapas-organico",
      origin: "México",
      region: "Chiapas",
      description: "Notas de vainilla y almendra, acidez muy suave.",
      roastLevel: Roast.MEDIUM,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 10.9, stock: 120 }],
      },
    },
    {
      name: "Honduras Marcala Natural",
      slug: "honduras-marcala-natural",
      origin: "Honduras",
      region: "Marcala",
      description: "Fruta madura, pasas y toque licoroso.",
      roastLevel: Roast.MEDIUM,
      process: Process.NATURAL,
      variants: {
        create: [{ weight: 250, price: 12.5, stock: 70 }],
      },
    },
    {
      name: "Nicaragua Jinotega Honey",
      slug: "nicaragua-jinotega-honey",
      origin: "Nicaragua",
      region: "Jinotega",
      description: "Dulzura frutal con notas de albaricoque.",
      roastLevel: Roast.MEDIUM,
      process: Process.HONEY,
      variants: {
        create: [{ weight: 500, price: 22.5, stock: 35 }],
      },
    },
    {
      name: "Ruanda Kivu Bourbon",
      slug: "ruanda-kivu-bourbon",
      origin: "Ruanda",
      region: "Lago Kivu",
      description: "Notas cítricas de naranja y regusto a té negro.",
      roastLevel: Roast.LIGHT,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 14.1, stock: 40 }],
      },
    },
    {
      name: "Perú Cajamarca Especial",
      slug: "peru-cajamarca-especial",
      origin: "Perú",
      region: "Cajamarca",
      description: "Frutos secos tostados y dulzura de azúcar moreno.",
      roastLevel: Roast.MEDIUM,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 11.8, stock: 100 }],
      },
    },
    {
      name: "Vietnam Robusta Fine",
      slug: "vietnam-robusta-fine",
      origin: "Vietnam",
      region: "Dak Lak",
      description: "Alta calidad, chocolate negro y mucha cafeína.",
      roastLevel: Roast.DARK,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 9.5, stock: 150 }],
      },
    },
    {
      name: "El Salvador Pacamara",
      slug: "el-salvador-pacamara",
      origin: "El Salvador",
      region: "Santa Ana",
      description: "Grano grande, notas de melocotón y acidez málica.",
      roastLevel: Roast.MEDIUM,
      process: Process.NATURAL,
      variants: {
        create: [{ weight: 250, price: 15.9, stock: 25 }],
      },
    },
    {
      name: "Tanzania Peaberry",
      slug: "tanzania-peaberry",
      origin: "Tanzania",
      region: "Kilimanjaro",
      description: "Granos redondos, concentración de frutos del bosque.",
      roastLevel: Roast.LIGHT,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 13.7, stock: 55 }],
      },
    },
    {
      name: "Uganda Bugisu Mount Elgon",
      slug: "uganda-bugisu-mount-elgon",
      origin: "Uganda",
      region: "Mount Elgon",
      description: "Potente cuerpo con notas de especias dulces.",
      roastLevel: Roast.MEDIUM,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 500, price: 19.8, stock: 45 }],
      },
    },
    {
      name: "India Malabar Monsooned",
      slug: "india-malabar-monsooned",
      origin: "India",
      region: "Karnataka",
      description: "Baja acidez, notas de madera y cuero.",
      roastLevel: Roast.DARK,
      process: Process.BARREL_AGED,
      variants: {
        create: [{ weight: 250, price: 13.0, stock: 60 }],
      },
    },
    {
      name: "Jamaica Blue Mountain",
      slug: "jamaica-blue-mountain",
      origin: "Jamaica",
      region: "Blue Mountains",
      description: "Famoso por su suavidad extrema y falta de amargor.",
      roastLevel: Roast.MEDIUM,
      process: Process.WASHED,
      variants: {
        create: [{ weight: 250, price: 55.0, stock: 8 }],
      },
    },
    {
      name: "Ecuador Loja Honey",
      slug: "ecuador-loja-honey",
      origin: "Ecuador",
      region: "Loja",
      description: "Notas de piña madura y miel de caña.",
      roastLevel: Roast.LIGHT,
      process: Process.HONEY,
      variants: {
        create: [{ weight: 250, price: 14.9, stock: 35 }],
      },
    },
  ];

  for (const coffee of coffeeData) {
    await prisma.product.create({ data: coffee });
  }

  console.log("✨ ¡Base de datos poblada con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
