import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, MessageCircle, Phone, Mail, Book, Users, Home, CreditCard, Shield, HelpCircle } from 'lucide-react';

export default function Help() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Toutes les catégories', icon: <Book className="w-5 h-5" /> },
    { id: 'account', name: 'Compte utilisateur', icon: <Users className="w-5 h-5" /> },
    { id: 'booking', name: 'Réservations', icon: <Home className="w-5 h-5" /> },
    { id: 'payment', name: 'Paiements', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'security', name: 'Sécurité', icon: <Shield className="w-5 h-5" /> },
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'Comment créer un compte sur CamerLogis ?',
      answer: 'Pour créer un compte, cliquez sur "Inscription" en haut à droite de la page. Choisissez votre type de compte (Étudiant ou Propriétaire), remplissez le formulaire avec vos informations personnelles et validez votre email.'
    },
    {
      id: 2,
      category: 'account',
      question: 'Comment modifier mes informations personnelles ?',
      answer: 'Connectez-vous à votre compte, cliquez sur votre nom en haut à droite, puis sélectionnez "Profil". Vous pourrez modifier toutes vos informations personnelles depuis cette page.'
    },
    {
      id: 3,
      category: 'booking',
      question: 'Comment réserver une chambre ?',
      answer: 'Parcourez les chambres disponibles, cliquez sur celle qui vous intéresse, puis sur "Réserver". Sélectionnez vos dates, vérifiez les détails et procédez au paiement pour confirmer votre réservation.'
    },
    {
      id: 4,
      category: 'booking',
      question: 'Puis-je annuler ma réservation ?',
      answer: 'Oui, vous pouvez annuler votre réservation depuis votre tableau de bord. Les conditions d\'annulation dépendent du délai : annulation gratuite jusqu\'à 48h avant la date d\'arrivée, puis des frais peuvent s\'appliquer.'
    },
    {
      id: 5,
      category: 'booking',
      question: 'Comment contacter le propriétaire d\'une chambre ?',
      answer: 'Une fois votre réservation confirmée, vous pouvez contacter le propriétaire via notre système de messagerie intégré. Allez dans votre tableau de bord et cliquez sur "Messages".'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Quels moyens de paiement acceptez-vous ?',
      answer: 'Nous acceptons les paiements par Mobile Money (MTN, Orange), virement bancaire, et cartes de crédit/débit. Tous les paiements sont sécurisés et cryptés.'
    },
    {
      id: 7,
      category: 'payment',
      question: 'Quand dois-je payer ma réservation ?',
      answer: 'Le paiement est requis au moment de la réservation pour confirmer votre demande. Certains propriétaires peuvent demander un acompte avec le solde à régler à l\'arrivée.'
    },
    {
      id: 8,
      category: 'payment',
      question: 'Comment obtenir un reçu de paiement ?',
      answer: 'Après chaque paiement, un reçu est automatiquement envoyé à votre adresse email. Vous pouvez aussi télécharger vos reçus depuis votre tableau de bord dans la section "Paiements".'
    },
    {
      id: 9,
      category: 'security',
      question: 'Comment vérifiez-vous les chambres et propriétaires ?',
      answer: 'Tous nos propriétaires doivent fournir des documents d\'identité et de propriété. Nos équipes vérifient chaque chambre avant publication. Les avis des étudiants nous aident aussi à maintenir la qualité.'
    },
    {
      id: 10,
      category: 'security',
      question: 'Mes données personnelles sont-elles sécurisées ?',
      answer: 'Absolument. Nous utilisons un cryptage SSL pour protéger vos données. Nous ne partageons jamais vos informations personnelles avec des tiers sans votre consentement explicite.'
    },
    {
      id: 11,
      category: 'account',
      question: 'J\'ai oublié mon mot de passe, que faire ?',
      answer: 'Cliquez sur "Mot de passe oublié" sur la page de connexion, entrez votre email, et suivez les instructions envoyées par email pour réinitialiser votre mot de passe.'
    },
    {
      id: 12,
      category: 'booking',
      question: 'Que faire si j\'ai un problème avec ma chambre ?',
      answer: 'Contactez immédiatement notre support client via le chat, email ou téléphone. Nous interviendrons rapidement pour résoudre le problème avec le propriétaire.'
    }
  ];

  const guides = [
    {
      title: 'Guide de l\'étudiant',
      description: 'Tout ce que vous devez savoir pour trouver et réserver votre chambre idéale',
      icon: <Users className="w-8 h-8 text-primary-600" />,
      steps: [
        'Créer votre compte étudiant',
        'Rechercher des chambres par quartier',
        'Comparer les prix et équipements',
        'Contacter les propriétaires',
        'Effectuer votre réservation',
        'Préparer votre arrivée'
      ]
    },
    {
      title: 'Guide du propriétaire',
      description: 'Comment mettre en location vos chambres et maximiser vos revenus',
      icon: <Home className="w-8 h-8 text-primary-600" />,
      steps: [
        'Créer votre compte propriétaire',
        'Ajouter vos chambres avec photos',
        'Fixer des prix compétitifs',
        'Gérer les demandes de réservation',
        'Communiquer avec les étudiants',
        'Suivre vos revenus'
      ]
    }
  ];

  const contactOptions = [
    {
      title: 'Chat en direct',
      description: 'Réponse immédiate pendant les heures d\'ouverture',
      icon: <MessageCircle className="w-8 h-8 text-primary-600" />,
      action: 'Démarrer le chat',
      available: true
    },
    {
      title: 'Téléphone',
      description: '+237 677 123 456',
      icon: <Phone className="w-8 h-8 text-primary-600" />,
      action: 'Appeler maintenant',
      available: true
    },
    {
      title: 'Email',
      description: 'support@camerlogis.cm',
      icon: <Mail className="w-8 h-8 text-primary-600" />,
      action: 'Envoyer un email',
      available: true
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-16 h-16 mx-auto mb-6 text-cameroon-yellow" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Centre d'aide
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe support
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-cameroon-yellow focus:border-transparent"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Contact */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Besoin d'aide immédiate ?
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {contactOptions.map((option, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 text-center hover:border-primary-300 transition-colors">
                    <div className="flex justify-center mb-3">
                      {option.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                      {option.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Guides */}
            <div className="grid md:grid-cols-2 gap-6">
              {guides.map((guide, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    {guide.icon}
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">
                      {guide.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">{guide.description}</p>
                  <ul className="space-y-2">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-center text-sm text-gray-600">
                        <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3">
                          {stepIndex + 1}
                        </div>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Questions fréquemment posées
              </h2>
              
              {filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucun résultat trouvé
                  </h3>
                  <p className="text-gray-600">
                    Essayez de modifier votre recherche ou sélectionnez une autre catégorie
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">{faq.question}</span>
                        {openFaq === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      {openFaq === faq.id && (
                        <div className="px-4 pb-4">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Still Need Help */}
            <div className="bg-primary-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vous ne trouvez pas ce que vous cherchez ?
              </h3>
              <p className="text-gray-600 mb-4">
                Notre équipe support est là pour vous aider personnellement
              </p>
              <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">
                Contacter le support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}