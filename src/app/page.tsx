"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, CheckCircle, Clock, Lightbulb, MessageCircle, Play, Sparkles, Star, Users, Video } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const handleNavigateToLogin = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 🔝 Bloco 1: Hero / Cabeçalho */}
      <section className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Video className="h-12 w-12 text-purple-600" />
            <Sparkles className="h-10 w-10 text-indigo-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Descubra o Futuro dos Vídeos<br />
            <span className="text-purple-600">com Inteligência Artificial</span>
          </h1>

          <h2 className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Aprenda diariamente com vídeos criados por IA, veja os prompts usados e participe da comunidade que está revolucionando a criação de conteúdo. Tudo por apenas <span className="font-bold text-purple-600">R$ 39,90/mês</span>.
          </h2>

          <div className="space-y-4">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={handleNavigateToLogin}
            >
              Quero fazer parte da comunidade
            </Button>
            <p className="text-sm text-gray-500">
              Acesso imediato aos mais de 50 vídeos IA e às atualizações diárias
            </p>
          </div>
        </div>
      </section>

      {/* 🎯 Bloco 2: Problema + Oportunidade */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Criar vídeos incríveis nunca foi tão fácil<br />
            <span className="text-gray-600">(ou tão difícil de acompanhar)</span>
          </h2>

          <div className="text-lg text-gray-700 leading-relaxed space-y-6 max-w-3xl mx-auto">
            <p>
              Todos os dias, milhares de criadores descobrem formas novas de usar IA para fazer vídeos virais, educativos, emocionantes. Mas…
            </p>

            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-3"></div>
                <p>Como saber quais prompts funcionam?</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-3"></div>
                <p>Como acompanhar as tendências que mudam todo dia?</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-3"></div>
                <p>Como aprender rápido, sem depender de tutoriais longos ou fóruns confusos?</p>
              </div>
            </div>

            <p className="text-xl font-semibold text-purple-600 pt-6">
              É por isso que a <strong>Criadores de Vídeos</strong> existe.
            </p>
          </div>
        </div>
      </section>

      {/* 🚀 Bloco 3: O que é a comunidade */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            A Comunidade para Criadores do Futuro
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <Video className="h-8 w-8 text-purple-600" />
                <h3 className="font-semibold">Mais de 50 vídeos criados com IA disponíveis imediatamente</h3>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
                <h3 className="font-semibold">Cada vídeo com o prompt exato usado para gerar</h3>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <h3 className="font-semibold">Novos vídeos todos os dias (10+ atualizações diárias)</h3>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <Users className="h-8 w-8 text-green-600" />
                <h3 className="font-semibold">Área de comentários para trocar ideias e dicas</h3>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <Brain className="h-8 w-8 text-red-600" />
                <h3 className="font-semibold">Aprenda a escrever melhores prompts</h3>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent className="space-y-3">
                <Lightbulb className="h-8 w-8 text-yellow-600" />
                <h3 className="font-semibold">Descubra novas ferramentas, modelos e hacks</h3>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              🔓 Acesso 100% online, a qualquer hora
            </Badge>
          </div>
        </div>
      </section>

      {/* 🧪 Bloco 4: Como funciona na prática */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            Veja como funciona por dentro:
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                  <p className="text-lg">Você entra com seu login</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <p className="text-lg">Tem acesso imediato à galeria com todos os vídeos</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <p className="text-lg">Clica em qualquer vídeo para ver o resultado e o prompt usado</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                  <p className="text-lg">Comenta, testa, adapta, aprende</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
                  <p className="text-lg">No dia seguinte, já tem novos vídeos para ver e se inspirar</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-8 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Reforço:</h3>
              <p className="text-lg text-gray-700">
                Tudo isso sem precisar programar, sem gastar com ferramentas caras e com a comunidade te apoiando.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 💥 Bloco 5: Gatilho de autoridade + tendência */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Os vídeos gerados por IA estão dominando o YouTube, TikTok e Instagram.
          </h2>

          <div className="text-lg leading-relaxed space-y-6">
            <p>
              Criadores anônimos estão viralizando todos os dias. Marcas estão economizando rios de dinheiro usando IA nos bastidores. E quem domina prompts + vídeo agora, vai estar anos à frente no mercado.
            </p>

            <p className="text-xl font-semibold text-yellow-400">
              Você pode esperar ou aprender agora com quem já está fazendo.
            </p>
          </div>
        </div>
      </section>

      {/* 👁️‍🗨️ Bloco 6: Exemplo visual */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center">
                  <Play className="h-12 w-12 text-purple-600" />
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Prompt usado:</strong> "Crie um vídeo de 30 segundos mostrando..."
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">24 comentários</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-500">4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
              onClick={handleNavigateToLogin}
            >
              Ver mais exemplos
            </Button>
          </div>
        </div>
      </section>

      {/* 🔒 Bloco 7: Preço e Garantia */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tudo isso por apenas <span className="text-purple-600">R$ 39,90/mês</span>
          </h2>

          <h3 className="text-xl text-gray-600 mb-8">
            Sem fidelidade. Cancele quando quiser.
          </h3>

          <div className="space-y-6 text-lg text-gray-700 max-w-3xl mx-auto">
            <p>
              Menos que 2 cafés por semana. E acesso a conhecimento prático, direto, atualizado diariamente.
            </p>

            <p className="text-xl font-semibold text-purple-600">
              👉 Se você quer acelerar seu aprendizado, ganhar tempo e se destacar com conteúdo que impressiona — essa comunidade é pra você.
            </p>
          </div>
        </div>
      </section>

      {/* 🧠 Bloco 8: Para quem é essa comunidade? */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            É pra você que…
          </h2>

          <div className="space-y-4">
            {[
              "Quer aprender a criar vídeos com IA do zero",
              "Já faz vídeos, mas quer melhorar seus prompts",
              "Trabalha com marketing, social media ou conteúdo",
              "Está montando um canal, marca ou projeto próprio",
              "Quer fazer parte de algo novo, que cresce todo dia"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🙋‍♂️ Bloco 9: Depoimentos */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6">
              <CardContent>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-4">
                  "Eu economizo horas por dia vendo como os outros fazem. Vale muito mais do que 39 reais."
                </blockquote>
                <cite className="text-gray-600 font-medium">– João, criador digital</cite>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardContent>
                <div className="flex mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-4">
                  "Estou aprendendo a fazer vídeos para meu negócio com IA só com o que vejo aqui."
                </blockquote>
                <cite className="text-gray-600 font-medium">– Luana, empreendedora</cite>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 🎯 Bloco 10: CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Comece hoje e veja o que já está rolando
          </h2>

          <div className="space-y-6">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-4 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={handleNavigateToLogin}
            >
              Quero entrar para a comunidade
            </Button>

            <div className="space-y-2 text-lg">
              <p>Acesso imediato. Cancelamento fácil. Aprendizado rápido.</p>
              <p className="text-xl font-semibold text-yellow-300">
                R$ 39,90/mês – menos que uma pizza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Video className="h-6 w-6 text-purple-400" />
            <span className="font-semibold text-white">Criadores de Vídeos</span>
          </div>
          <p>© 2024 Criadores de Vídeos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
