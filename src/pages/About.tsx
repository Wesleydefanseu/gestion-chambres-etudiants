import React from 'react';
import { Users, Shield, Award, MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';

export default function About() {
  const team = [
    {
      name: 'Wesley De Fanseu',
      role: 'Fondatrice & CEO',
      image: 'https://images.pexels.com/photos/8386422/pexels-photo-8386422.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Experte en immobilier avec 10 ans d\'expérience à Douala'
    },
    {
      name: 'Shayn Kouegang',
      role: 'Directrice Technique',
      image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Ingénieure logiciel passionnée par l\'innovation'
    },
    {
      name: 'Farel Sonhana',
      role: 'Responsable Relations Clients',
      image: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=300',
      description: 'Spécialiste en service client et satisfaction utilisateur'
    }
  ];

  const values = [
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: 'Sécurité',
      description: 'Toutes nos chambres sont vérifiées et nos transactions sécurisées'
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Communauté',
      description: 'Nous créons des liens durables entre étudiants et propriétaires'
    },
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: 'Excellence',
      description: 'Nous nous engageons à fournir le meilleur service possible'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Étudiants satisfaits' },
    { number: '800+', label: 'Chambres disponibles' },
    { number: '150+', label: 'Propriétaires partenaires' },
    { number: '98%', label: 'Taux de satisfaction' }
  ];

  const achievements = [
    'Plateforme #1 pour le logement étudiant à Douala',
    'Plus de 5000 réservations réussies',
    'Partenariat avec les principales universités',
    'Service client disponible 24h/7j',
    'Application mobile primée',
    'Système de paiement sécurisé certifié'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
              À propos de
              <span className="block text-cameroon-yellow">KmerLogis</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-100">
              Nous révolutionnons le marché du logement étudiant au Cameroun en connectant 
              étudiants et propriétaires sur une plateforme moderne et sécurisée.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
                Notre Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                KmerLogis a été créé avec une vision simple : faciliter l'accès au logement 
                pour les étudiants camerounais tout en offrant aux propriétaires une plateforme 
                moderne pour gérer leurs biens immobiliers.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Nous croyons que chaque étudiant mérite un logement décent, sûr et abordable 
                pour réussir ses études. C'est pourquoi nous mettons tout en œuvre pour 
                simplifier la recherche et la réservation de chambres à Douala.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Équipe KmerLogis"
                className="rounded-xl shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 bg-cameroon-yellow p-6 rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-gray-900">5+</div>
                <div className="text-sm text-gray-700">Années d'expérience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Nos Valeurs
            </h2>
            <p className="text-xl text-gray-600">
              Les principes qui guident notre action au quotidien
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Notre Équipe
            </h2>
            <p className="text-xl text-gray-600">
              Des professionnels passionnés au service de votre réussite
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Nos Réalisations
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Depuis notre création, nous avons franchi de nombreuses étapes importantes 
                qui témoignent de notre engagement envers l'excellence.
              </p>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-cameroon-yellow flex-shrink-0" />
                    <span className="text-primary-100">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Nos réalisations"
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Nous Contacter
            </h2>
            <p className="text-xl text-gray-600">
              Notre équipe est là pour vous accompagner
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="flex justify-center mb-4">
                <MapPin className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Adresse
              </h3>
              <p className="text-gray-600">
                Logbessou, Douala<br />
                Cameroun
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Phone className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Téléphone
              </h3>
              <p className="text-gray-600">
               +237 654 545 696<br />
                +237 682 470 529
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md text-center">
              <div className="flex justify-center mb-4">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email
              </h3>
              <p className="text-gray-600">
                contact@kmerlogis.cm<br />
                support@kmerlogis.cm
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white p-8 rounded-xl shadow-md">
            <div className="flex items-center justify-center space-x-4 text-primary-600">
              <Clock className="w-6 h-6" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Horaires d'ouverture
                </h3>
                <p className="text-gray-600">
                  Lundi - Vendredi: 8h00 - 18h00 | Samedi: 9h00 - 15h00
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}