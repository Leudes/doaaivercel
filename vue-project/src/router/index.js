import { createRouter, createWebHistory } from 'vue-router'

// --- Importação das Views Principais ---
import HomeView from '../views/HomeView.vue'
import ItensView from '../views/ItensView.vue'
import CampanhasView from '../views/CampanhasView.vue'
import CampanhaDetalhesView from '../views/CampanhaDetalhesView.vue'
import SobreView from '../views/SobreView.vue'
import LoginView from '../views/LoginView.vue'
import PerfilUsuarioView from '../views/PerfilUsuarioView.vue'
import PerfilInstituicaoView from '../views/PerfilInstituicaoView.vue'
import PainelInstituicaoView from '../views/PainelInstituicaoView.vue'
import QueroDoarView from '../views/QueroDoarView.vue'
import MinhasDoacoesView from '../views/MinhasDoacoesView.vue'
import EsqueciSenhaView from '../views/EsqueciSenhaView.vue'
import RedefinirSenhaView from '../views/RedefinirSenhaView.vue'

// --- Lazy Loading para Cadastros (Otimização) ---
const CadastroUsuarioView = () => import('../views/CadastroUsuarioView.vue')
const CadastroInstituicaoView = () => import('../views/CadastroInstituicaoView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/sobre',
      name: 'sobre',
      component: SobreView
    },
    // --- Doações e Campanhas ---
    {
      path: '/itens',
      name: 'itens',
      component: ItensView
    },
    {
      path: '/campanhas',
      name: 'campanhas',
      component: CampanhasView
    },
    {
      path: '/campanha/:id',
      name: 'campanha-detalhes',
      component: CampanhaDetalhesView
    },
    {
      path: '/quero-doar',
      name: 'quero-doar',
      component: QueroDoarView
    },
    
    // --- Autenticação ---
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/cadastro',
      name: 'cadastro',
      component: CadastroUsuarioView
    },
    {
      path: '/cadastro-instituicao',
      name: 'cadastro-instituicao',
      component: CadastroInstituicaoView
    },
    {
      path: '/esqueci-senha',
      name: 'esqueci-senha',
      component: EsqueciSenhaView
    },
    {
      path: '/redefinir-senha',
      name: 'redefinir-senha',
      component: RedefinirSenhaView
    },

    // --- Áreas Logadas (Usuário Comum) ---
    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilUsuarioView
    },
    {
      path: '/minhas-doacoes',
      name: 'minhas-doacoes',
      component: MinhasDoacoesView
    },

    // --- Áreas Logadas (Instituição) ---
    {
      path: '/perfil-instituicao',
      name: 'perfil-instituicao',
      component: PerfilInstituicaoView
    },
    {
      path: '/painel-instituicao',
      name: 'painel-instituicao',
      component: PainelInstituicaoView
    },

    // --- Placeholder para Configurações ---
    // Como não tínhamos o HTML original, redireciono para o perfil ou renderizo um aviso
    {
      path: '/configuracoes',
      name: 'configuracoes',
      component: { template: '<main style="text-align:center; padding:50px;"><h1>Configurações</h1><p>Em construção...</p></main>' }
    }
  ]
})

export default router