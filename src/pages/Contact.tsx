import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, User, Building, CheckCircle, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    userType: 'student'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      // Validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
        setError('Veuillez remplir tous les champs obligatoires');
        return;
      }

      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Veuillez entrer une adresse email valide');
        return;
      }

      // Simulation d'envoi avec délai réaliste
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler succès (95% de chance)
      if (Math.random() > 0.05) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          userType: 'student'
        });
      } else {
        setError('Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-primary-600" />,
      title: 'Adresse',
      details: ['Logbessou, Douala', 'Cameroun'],
      action: 'Voir sur la carte'
    },
    {
      icon: <Phone className="w-6 h-6 text-primary-600" />,
      title: 'Téléphone',
      details: ['+237 654 545 696', '+237 682 470 529'],
      action: 'Appeler maintenant'
    },
    {
      icon: <Mail className="w-6 h-6 text-primary-600" />,
      title: 'Email',
      details: ['contact@kmerlogis.cm', 'support@kmerlogis.cm'],
      action: 'Envoyer un email'
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-600" />,
      title: 'Horaires',
      details: ['Lun - Ven: 8h00 - 18h00', 'Sam: 9h00 - 15h00'],
      action: 'Voir les détails'
    }
  ];

  const departments = [
    {
      name: 'Support Étudiants',
      description: 'Aide pour la recherche et réservation de chambres',
      email: 'etudiants@camerlogis.cm',
      phone: '+237 677 123 456'
    },
    {
      name: 'Support Propriétaires',
      description: 'Assistance pour la gestion de vos biens',
      email: 'proprietaires@kmerlogis.cm',
      phone: '+237 699 887 766'
    },
    {
      name: 'Support Technique',
      description: 'Problèmes techniques et bugs',
      email: 'technique@kmerlogis.cm',
      phone: '+237 677 998 877'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-6 text-cameroon-yellow" />
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Contactez-nous
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Notre équipe est là pour répondre à toutes vos questions et vous accompagner 
            dans votre recherche de logement étudiant
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envoyez-nous un message
              </h2>
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-green-800 font-medium">Message envoyé avec succès !</p>
                      <p className="text-green-700 text-sm">Nous vous répondrons dans les plus brefs délais.</p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <p className="text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Votre nom complet"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                      Vous êtes *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <select
                        id="userType"
                        name="userType"
                        required
                        value={formData.userType}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="student">Étudiant</option>
                        <option value="owner">Propriétaire</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Objet de votre message"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Décrivez votre demande en détail..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Envoyer le message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {info.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {info.title}
                      </h3>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-600 mb-1">
                          {detail}
                        </p>
                      ))}
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2">
                        {info.action}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Departments */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Départements spécialisés
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Contactez directement le service qui correspond à votre besoin
              </p>
              <div className="space-y-4">
                {departments.map((dept, index) => (
                  <div key={index} className="border-l-4 border-primary-200 pl-4">
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{dept.description}</p>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-primary-600" />
                        <a href={`mailto:${dept.email}`} className="text-primary-600 hover:text-primary-700">
                          {dept.email}
                        </a>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <a href={`tel:${dept.phone}`} className="text-gray-600 hover:text-gray-800">
                          {dept.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Besoin d'aide urgente ?
              </h3>
              <p className="text-red-700 text-sm mb-3">
                Pour les situations urgentes nécessitant une intervention immédiate
              </p>
              <div className="space-y-2">
                <a 
                  href="tel:+237677000000"
                  className="block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium text-center"
                >
                  📞 Ligne d'urgence: +237 654 000 000
                </a>
                <p className="text-red-600 text-xs text-center">
                  Disponible 24h/24 - 7j/7
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Notre localisation
          </h2>
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-64 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p className="font-medium">Carte interactive - Akwa, Douala</p>
              <p className="text-sm">Intégration Google Maps à venir</p>
              <div className="mt-4 text-xs text-gray-400">
                <p>📍 Latitude: 4.0511° N</p>
                <p>📍 Longitude: 9.7679° E</p>
              </div>
            </div>
          </div>
          
          {/* Informations d'accès */}
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🚗 En voiture</h4>
              <p className="text-sm text-gray-600">
                Parking gratuit disponible. Accès facile depuis l'autoroute Douala-Yaoundé.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">🚌 Transport public</h4>
              <p className="text-sm text-gray-600">
                Arrêt de bus "Akwa Centre" à 200m. Taxis disponibles 24h/24.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}