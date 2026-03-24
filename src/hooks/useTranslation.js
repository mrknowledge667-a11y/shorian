import { useLanguage } from '../contexts/LanguageContext';
import { fetchTranslations } from '../api/content';
import { useState, useEffect } from 'react';

// Default translations for common UI elements
const defaultTranslations = {
  en: {
    'button.details': 'Details',
    'button.inquire': 'Inquire',
    'button.add_to_cart': 'Add to Cart',
    'button.view_more': 'View More',
    'button.contact_us': 'Contact Us',
    'button.submit': 'Submit',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.edit': 'Edit',
    'button.delete': 'Delete',
    'label.new': 'NEW',
    'label.refurbished': 'Refurbished',
    'label.used': 'Used',
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.services': 'Services',
    'nav.contact': 'Contact Us',
    'search.placeholder': 'Search...',
    'footer.rights': 'All rights reserved',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.head_office': 'Head Office',
    'footer.about_us': 'About Us',
    'footer.follow_us': 'Follow Us',
    'map.title': 'Visit Our Medical Center',
    'map.contact_info_title': 'Contact Information',
    'map.address': 'Address',
    'map.email': 'Email',
    'map.phone': 'Phone',
    'map.working_hours': 'Working Hours',
    'map.get_directions': 'Get Directions',
    'about.title': 'About WiMed',
    'about.subtitle': 'Leading supplier of medical equipment in the UK, dedicated to improving healthcare delivery through innovative solutions and exceptional service',
    'about.story_title': 'Our Story',
    'about.team_title': 'Our Leadership Team',
    'about.cta_title': 'Partner with WiMed Today',
    'about.cta_subtitle': 'Your Trusted Medical Equipment Partner',
    'about.cta_description': 'Discover how our medical equipment solutions can enhance your healthcare facility. Contact us at: info@wimed.fr | +44 740 445 6671',
    // Services page translations
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive medical equipment services to support healthcare providers with installation, maintenance, training, and technical support',
    'services.why_choose_title': 'Why Choose Our Services?',
    'services.expertise_title': 'Expertise & Experience',
    'services.expertise_description': 'Over 20 years of experience in medical equipment services with certified technicians trained on the latest technologies.',
    'services.quality_title': 'Quality Assurance',
    'services.quality_description': 'ISO certified processes ensuring the highest standards of service quality and equipment performance.',
    'services.satisfaction_title': 'Customer Satisfaction',
    'services.satisfaction_description': 'Dedicated to exceeding customer expectations with responsive support and tailored service solutions.',
    // Contact page translations
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Get in touch with our team for inquiries, support, or to discuss your medical equipment needs',
    'contact.address_title': 'Address',
    'contact.phone_title': 'Phone',
    'contact.whatsapp_title': 'WhatsApp',
    'contact.email_title': 'Email',
    'contact.hours_title': 'Business Hours',
    'contact.hours_weekdays': 'Monday - Friday: 9:00 AM - 6:00 PM',
    'contact.hours_saturday': 'Saturday: 10:00 AM - 4:00 PM',
    'contact.hours_sunday': 'Sunday: Closed',
    'contact.cta_title': 'Get in Touch Today',
    'contact.cta_subtitle': 'Quick Response Guarantee',
    'contact.cta_description': 'We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly and we\'ll assist you immediately.',
    'contact.success_message': 'Thank you for your message! We\'ll get back to you soon.',
    // Category page translations
    'category.anaesthesia.title': 'Anaesthesia Equipment',
    'category.patient_monitors.title': 'Patient Monitoring Equipment',
    'category.electrosurgical.title': 'Electrosurgical Equipment',
    'category.endoscopes.title': 'Flexible Endoscopes',
    'category.endoscopy_laparoscopy.title': 'Endoscopy & Laparoscopy Equipment',
    'category.ventilators.title': 'Ventilators & Respiratory Equipment',
    // Blog translations
    'blog.title': 'Blog',
    'blog.subtitle': 'Expert insights and updates on medical equipment and healthcare technology',
    'blog.meta_title': 'WiMed Blog - Medical Equipment Insights & Updates',
    'blog.search_placeholder': 'Search blog posts...',
    'blog.filter_by_category': 'Filter by Category',
    'blog.filter_by_tag': 'Filter by Tag',
    'blog.all_posts': 'All Posts',
    'blog.clear_filters': 'Clear Filters',
    'blog.no_posts_found': 'No posts found',
    'blog.reading_time': 'min read',
    'blog.views': 'views',
    'blog.categories': 'Categories',
    'blog.tags': 'Popular Tags',
    'blog.share': 'Share',
    'blog.share_twitter': 'Share on Twitter',
    'blog.share_facebook': 'Share on Facebook',
    'blog.share_linkedin': 'Share on LinkedIn',
    'blog.copy_link': 'Copy Link',
    'blog.link_copied': 'Link copied to clipboard',
    'blog.back_to_blog': 'Back to Blog',
    'blog.by_author': 'By',
    'blog.related_posts': 'Related Posts',
  },
  es: {
    'button.details': 'Detalles',
    'button.inquire': 'Consultar',
    'button.add_to_cart': 'Añadir al Carrito',
    'button.view_more': 'Ver Más',
    'button.contact_us': 'Contáctanos',
    'button.submit': 'Enviar',
    'button.cancel': 'Cancelar',
    'button.save': 'Guardar',
    'button.edit': 'Editar',
    'button.delete': 'Eliminar',
    'label.new': 'NUEVO',
    'label.refurbished': 'Reacondicionado',
    'label.used': 'Usado',
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.services': 'Servicios',
    'nav.contact': 'Contacto',
    'search.placeholder': 'Buscar...',
    'footer.rights': 'Todos los derechos reservados',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos de Servicio',
    'footer.head_office': 'Oficina Principal',
    'footer.about_us': 'Acerca de Nosotros',
    'footer.follow_us': 'Síguenos',
    'map.title': 'Visite Nuestro Centro Médico',
    'map.contact_info_title': 'Información de Contacto',
    'map.address': 'Dirección',
    'map.email': 'Correo Electrónico',
    'map.phone': 'Teléfono',
    'map.working_hours': 'Horario de Trabajo',
    'map.get_directions': 'Obtener Direcciones',
    'about.title': 'Acerca de WiMed',
    'about.subtitle': 'Proveedor líder de equipos médicos en el Reino Unido, dedicado a mejorar la prestación de servicios de salud a través de soluciones innovadoras y un servicio excepcional',
    'about.story_title': 'Nuestra Historia',
    'about.team_title': 'Nuestro Equipo de Liderazgo',
    'about.cta_title': 'Asóciese con WiMed Hoy',
    'about.cta_subtitle': 'Su Socio de Confianza en Equipos Médicos',
    'about.cta_description': 'Descubra cómo nuestras soluciones de equipos médicos pueden mejorar su centro de salud. Contáctenos: info@wimed.fr | +44 740 445 6671',
    // Services page translations
    'services.title': 'Nuestros Servicios',
    'services.subtitle': 'Servicios integrales de equipos médicos para apoyar a los proveedores de atención médica con instalación, mantenimiento, capacitación y soporte técnico',
    'services.why_choose_title': '¿Por Qué Elegir Nuestros Servicios?',
    'services.expertise_title': 'Experiencia y Conocimientos',
    'services.expertise_description': 'Más de 20 años de experiencia en servicios de equipos médicos con técnicos certificados capacitados en las últimas tecnologías.',
    'services.quality_title': 'Garantía de Calidad',
    'services.quality_description': 'Procesos certificados ISO que garantizan los más altos estándares de calidad de servicio y rendimiento de equipos.',
    'services.satisfaction_title': 'Satisfacción del Cliente',
    'services.satisfaction_description': 'Dedicados a superar las expectativas del cliente con soporte receptivo y soluciones de servicio personalizadas.',
    // Contact page translations
    'contact.title': 'Contáctenos',
    'contact.subtitle': 'Póngase en contacto con nuestro equipo para consultas, soporte o para discutir sus necesidades de equipos médicos',
    'contact.address_title': 'Dirección',
    'contact.phone_title': 'Teléfono',
    'contact.whatsapp_title': 'WhatsApp',
    'contact.email_title': 'Correo Electrónico',
    'contact.hours_title': 'Horario de Atención',
    'contact.hours_weekdays': 'Lunes - Viernes: 9:00 AM - 6:00 PM',
    'contact.hours_saturday': 'Sábado: 10:00 AM - 4:00 PM',
    'contact.hours_sunday': 'Domingo: Cerrado',
    'contact.cta_title': 'Contáctenos Hoy',
    'contact.cta_subtitle': 'Garantía de Respuesta Rápida',
    'contact.cta_description': 'Nuestro objetivo es responder a todas las consultas dentro de las 24 horas durante los días hábiles. Para asuntos urgentes, llámenos directamente y lo asistiremos de inmediato.',
    'contact.success_message': 'Gracias por su mensaje! Nos pondremos en contacto con usted pronto.',
    // Category page translations
    'category.anaesthesia.title': 'Equipos de Anestesia',
    'category.patient_monitors.title': 'Equipos de Monitoreo de Pacientes',
    'category.electrosurgical.title': 'Equipos Electroquirúrgicos',
    'category.endoscopes.title': 'Endoscopios Flexibles',
    'category.endoscopy_laparoscopy.title': 'Equipos de Endoscopia y Laparoscopia',
    'category.ventilators.title': 'Ventiladores y Equipos Respiratorios',
    // Blog translations
    'blog.title': 'Blog',
    'blog.subtitle': 'Perspectivas expertas y actualizaciones sobre equipos médicos y tecnología sanitaria',
    'blog.meta_title': 'Blog de WiMed - Perspectivas y Actualizaciones de Equipos Médicos',
    'blog.search_placeholder': 'Buscar publicaciones...',
    'blog.filter_by_category': 'Filtrar por Categoría',
    'blog.filter_by_tag': 'Filtrar por Etiqueta',
    'blog.all_posts': 'Todas las Publicaciones',
    'blog.clear_filters': 'Limpiar Filtros',
    'blog.no_posts_found': 'No se encontraron publicaciones',
    'blog.reading_time': 'min de lectura',
    'blog.views': 'vistas',
    'blog.categories': 'Categorías',
    'blog.tags': 'Etiquetas Populares',
    'blog.share': 'Compartir',
    'blog.share_twitter': 'Compartir en Twitter',
    'blog.share_facebook': 'Compartir en Facebook',
    'blog.share_linkedin': 'Compartir en LinkedIn',
    'blog.copy_link': 'Copiar Enlace',
    'blog.link_copied': 'Enlace copiado al portapapeles',
    'blog.back_to_blog': 'Volver al Blog',
    'blog.by_author': 'Por',
    'blog.related_posts': 'Publicaciones Relacionadas',
  },
  fr: {
    'button.details': 'Détails',
    'button.inquire': 'Demander',
    'button.add_to_cart': 'Ajouter au Panier',
    'button.view_more': 'Voir Plus',
    'button.contact_us': 'Contactez-nous',
    'button.submit': 'Soumettre',
    'button.cancel': 'Annuler',
    'button.save': 'Enregistrer',
    'button.edit': 'Modifier',
    'button.delete': 'Supprimer',
    'label.new': 'NOUVEAU',
    'label.refurbished': 'Reconditionné',
    'label.used': 'Utilisé',
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'search.placeholder': 'Rechercher...',
    'footer.rights': 'Tous droits réservés',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.head_office': 'Siège Social',
    'footer.about_us': 'À Propos de Nous',
    'footer.follow_us': 'Suivez-nous',
    'map.title': 'Visitez Notre Centre Médical',
    'map.contact_info_title': 'Informations de Contact',
    'map.address': 'Adresse',
    'map.email': 'Email',
    'map.phone': 'Téléphone',
    'map.working_hours': 'Heures de Travail',
    'map.get_directions': 'Obtenir l\'Itinéraire',
    'about.title': 'À Propos de WiMed',
    'about.subtitle': 'Fournisseur leader d\'équipements médicaux au Royaume-Uni, dédié à l\'amélioration de la prestation de soins de santé grâce à des solutions innovantes et un service exceptionnel',
    'about.story_title': 'Notre Histoire',
    'about.team_title': 'Notre Équipe de Direction',
    'about.cta_title': 'Associez-vous à WiMed Aujourd\'hui',
    'about.cta_subtitle': 'Votre Partenaire de Confiance en Équipement Médical',
    'about.cta_description': 'Découvrez comment nos solutions d\'équipement médical peuvent améliorer votre établissement de santé. Contactez-nous : info@wimed.fr | +44 740 445 6671',
    // Services page translations
    'services.title': 'Nos Services',
    'services.subtitle': 'Services complets d\'équipements médicaux pour soutenir les prestataires de soins de santé avec installation, maintenance, formation et support technique',
    'services.why_choose_title': 'Pourquoi Choisir Nos Services?',
    'services.expertise_title': 'Expertise et Expérience',
    'services.expertise_description': 'Plus de 20 ans d\'expérience dans les services d\'équipements médicaux avec des techniciens certifiés formés aux dernières technologies.',
    'services.quality_title': 'Assurance Qualité',
    'services.quality_description': 'Processus certifiés ISO garantissant les normes les plus élevées de qualité de service et de performance des équipements.',
    'services.satisfaction_title': 'Satisfaction Client',
    'services.satisfaction_description': 'Dédiés à dépasser les attentes des clients avec un support réactif et des solutions de service sur mesure.',
    // Contact page translations
    'contact.title': 'Contactez-nous',
    'contact.subtitle': 'Contactez notre équipe pour des demandes de renseignements, du support ou pour discuter de vos besoins en équipements médicaux',
    'contact.address_title': 'Adresse',
    'contact.phone_title': 'Téléphone',
    'contact.whatsapp_title': 'WhatsApp',
    'contact.email_title': 'Email',
    'contact.hours_title': 'Heures d\'Ouverture',
    'contact.hours_weekdays': 'Lundi - Vendredi: 9h00 - 18h00',
    'contact.hours_saturday': 'Samedi: 10h00 - 16h00',
    'contact.hours_sunday': 'Dimanche: Fermé',
    'contact.cta_title': 'Contactez-nous Aujourd\'hui',
    'contact.cta_subtitle': 'Garantie de Réponse Rapide',
    'contact.cta_description': 'Nous nous efforçons de répondre à toutes les demandes dans les 24 heures pendant les jours ouvrables. Pour les questions urgentes, veuillez nous appeler directement et nous vous aiderons immédiatement.',
    'contact.success_message': 'Merci pour votre message! Nous vous répondrons bientôt.',
    // Category page translations
    'category.anaesthesia.title': 'Équipement d\'Anesthésie',
    'category.patient_monitors.title': 'Équipement de Surveillance des Patients',
    'category.electrosurgical.title': 'Équipement Électrochirurgical',
    'category.endoscopes.title': 'Endoscopes Flexibles',
    'category.endoscopy_laparoscopy.title': 'Équipement d\'Endoscopie et de Laparoscopie',
    'category.ventilators.title': 'Ventilateurs et Équipements Respiratoires',
    // Blog translations
    'blog.title': 'Blog',
    'blog.subtitle': 'Perspectives d\'experts et mises à jour sur les équipements médicaux et la technologie de la santé',
    'blog.meta_title': 'Blog WiMed - Perspectives et Mises à Jour sur les Équipements Médicaux',
    'blog.search_placeholder': 'Rechercher des articles...',
    'blog.filter_by_category': 'Filtrer par Catégorie',
    'blog.filter_by_tag': 'Filtrer par Étiquette',
    'blog.all_posts': 'Tous les Articles',
    'blog.clear_filters': 'Effacer les Filtres',
    'blog.no_posts_found': 'Aucun article trouvé',
    'blog.reading_time': 'min de lecture',
    'blog.views': 'vues',
    'blog.categories': 'Catégories',
    'blog.tags': 'Étiquettes Populaires',
    'blog.share': 'Partager',
    'blog.share_twitter': 'Partager sur Twitter',
    'blog.share_facebook': 'Partager sur Facebook',
    'blog.share_linkedin': 'Partager sur LinkedIn',
    'blog.copy_link': 'Copier le Lien',
    'blog.link_copied': 'Lien copié dans le presse-papiers',
    'blog.back_to_blog': 'Retour au Blog',
    'blog.by_author': 'Par',
    'blog.related_posts': 'Articles Connexes',
  },
};

export const useTranslation = () => {
  const { currentLanguage } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load translations from database
    const loadTranslations = async () => {
      setLoading(true);
      try {
        // Fetch translations from database
        const dbTranslations = await fetchTranslations(currentLanguage);
        console.log('Database translations loaded:', dbTranslations?.length || 0, 'translations for', currentLanguage);
        
        // Convert array of translations to key-value object
        const translationsMap = {};
        if (dbTranslations && Array.isArray(dbTranslations)) {
          dbTranslations.forEach(trans => {
            translationsMap[trans.translation_key] = trans.translation_value;
          });
        }
        
        // Log category translations found in database
        const categoryKeys = Object.keys(translationsMap).filter(key => key.startsWith('category.'));
        console.log('Category translations from database:', categoryKeys);
        
        // Merge database translations with defaults (database takes precedence)
        const langDefaults = defaultTranslations[currentLanguage] || defaultTranslations.en;
        const finalTranslations = { ...langDefaults, ...translationsMap };
        
        setTranslations(finalTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to defaults
        setTranslations(defaultTranslations[currentLanguage] || defaultTranslations.en);
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const t = (key, defaultValue) => {
    // Check if we have a translation for this key
    if (translations[key]) {
      return translations[key];
    }
    
    // If no translation found, return the default value or the key itself
    return defaultValue || key;
  };

  return { t, loading };
};

// Helper function for static translations
export const getStaticTranslation = (key, language = 'en') => {
  const langTranslations = defaultTranslations[language] || defaultTranslations.en;
  return langTranslations[key] || key;
};