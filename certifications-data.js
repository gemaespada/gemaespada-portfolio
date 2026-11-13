/**
 * ==========================================================================
 * ITINERARIO FORMATIVO DEL MÁSTER Y CERTIFICADOS — GEMA ESPADA VALVERDE
 * Estructura desacoplada para la línea temporal vertical de Formación (#formacion)
 * y el visor modal Liquid Glass (#cert-modal).
 * ==========================================================================
 */

window.CERTIFICATIONS_DATA = [
  {
    id: 'pseudocodigo',
    title: {
      es: 'Pseudocódigo',
      en: 'Pseudocode'
    },
    icons: ['#i-code'],
    hasCertificate: true,
    fileUrl: '/assets/certificates/certificado-pseudocodigo.pdf',
    previewImage: '/assets/certificates/previews/certificado-pseudocodigo.jpg'
  },
  {
    id: 'linux-y-la-terminal',
    title: {
      es: 'Linux y la Terminal',
      en: 'Linux and the Terminal'
    },
    icons: ['#i-linux'],
    hasCertificate: true,
    fileUrl: '/assets/certificates/certificado-linux-y-la-terminal.pdf',
    previewImage: '/assets/certificates/previews/certificado-linux-y-la-terminal.jpg'
  },
  {
    id: 'python',
    title: {
      es: 'Python',
      en: 'Python'
    },
    icons: ['#i-python'],
    hasCertificate: false,
    children: [
      {
        id: 'cert-python',
        title: {
          es: 'Python',
          en: 'Python'
        },
        hasCertificate: true,
        fileUrl: '/assets/certificates/certificado-python.pdf',
        previewImage: '/assets/certificates/previews/certificado-python.jpg'
      },
      {
        id: 'principios-solid-y-acceso-a-bases-de-datos',
        title: {
          es: 'Principios SOLID y acceso a Bases de datos',
          en: 'SOLID Principles and Database Access'
        },
        hasCertificate: true,
        fileUrl: '/assets/certificates/certificado-principios-solid-y-acceso-a-bases-de-datos.pdf',
        previewImage: '/assets/certificates/previews/certificado-principios-solid-y-acceso-a-bases-de-datos.jpg'
      },
      {
        id: 'uso-de-orms-en-python',
        title: {
          es: 'Uso de ORMs en Python',
          en: 'Using ORMs in Python'
        },
        hasCertificate: true,
        fileUrl: '/assets/certificates/certificado-uso-de-orms-en-python.pdf',
        previewImage: '/assets/certificates/previews/certificado-uso-de-orms-en-python.jpg'
      },
      {
        id: 'python-avanzado',
        title: {
          es: 'Python avanzado',
          en: 'Advanced Python'
        },
        hasCertificate: true,
        fileUrl: '/assets/certificates/certificado-python-avanzado.pdf',
        previewImage: '/assets/certificates/previews/certificado-python-avanzado.jpg'
      }
    ]
  },
  {
    id: 'git-y-github',
    title: {
      es: 'Git y GitHub',
      en: 'Git and GitHub'
    },
    icons: ['#i-git', '#i-github'],
    hasCertificate: true,
    fileUrl: '/assets/certificates/certificado-git-y-github.pdf',
    previewImage: '/assets/certificates/previews/certificado-git-y-github.jpg'
  },
  {
    id: 'sql',
    title: {
      es: 'SQL',
      en: 'SQL'
    },
    icons: ['#i-db'],
    hasCertificate: true,
    fileUrl: '/assets/certificates/certificado-sql.pdf',
    previewImage: '/assets/certificates/previews/certificado-sql.jpg'
  },
  {
    id: 'ia-google-antigravity',
    title: {
      es: 'IA Google Antigravity',
      en: 'Google Antigravity AI'
    },
    icons: ['#i-antigravity'],
    hasCertificate: false,
    completed: true
  },
  {
    id: 'automatizaciones-y-agentes',
    title: {
      es: 'Automatizaciones y Agentes',
      en: 'Automations and Agents'
    },
    icons: ['#i-workflow'],
    hasCertificate: false,
    completed: true
  }
];
