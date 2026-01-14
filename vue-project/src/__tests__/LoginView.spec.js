import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginView from '@/views/LoginView.vue'

// 1. Mock do Vue Router (para não dar erro no useRouter)
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  RouterLink: { template: '<a><slot /></a>' } // Mock do componente link
}))

// 2. Mock do fetch global e localStorage
global.fetch = vi.fn()
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
}
global.localStorage = localStorageMock

describe('LoginView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o formulário corretamente', () => {
    const wrapper = mount(LoginView)
    expect(wrapper.find('h1').text()).toBe('Login')
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
  })

  it('deve exibir erro se tentar logar com campos vazios', async () => {
    const wrapper = mount(LoginView)
    
    // Clica no botão sem preencher nada
    await wrapper.find('form').trigger('submit.prevent')
    
    // Verifica se a mensagem de erro apareceu
    expect(wrapper.text()).toContain('Preencha todos os campos')
  })

  it('deve realizar login com sucesso e redirecionar', async () => {
    const wrapper = mount(LoginView)

    // Simula resposta positiva da API
    global.fetch
      .mockResolvedValueOnce({ // Resposta do Login
        ok: true,
        json: async () => ({ jwt: 'token-falso-123' })
      })
      .mockResolvedValueOnce({ // Resposta do /users/me
        ok: true,
        json: async () => ({ instituicao: false })
      })

    // Preenche os campos
    await wrapper.find('input[type="email"]').setValue('teste@email.com')
    await wrapper.find('input[type="password"]').setValue('123456')

    // Submete
    await wrapper.find('form').trigger('submit.prevent')

    // Espera as promessas resolverem (flushPromises seria ideal, mas um timeout curto serve)
    await new Promise(resolve => setTimeout(resolve, 10))

    // Verifica se salvou o token
    expect(localStorageMock.setItem).toHaveBeenCalledWith('jwt', 'token-falso-123')
    
    // Verifica se redirecionou para o perfil
    expect(mockPush).toHaveBeenCalledWith('/perfil')
  })
})