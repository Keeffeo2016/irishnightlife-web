export type LoginSuccessBody = {
  success: true
  user: {
    id: string
    email: string | undefined
  }
  role: string | null
}

export function buildLoginSuccessBody(input: {
  userId: string
  email: string | undefined
  role: string | null
}): LoginSuccessBody {
  return {
    success: true,
    user: {
      id: input.userId,
      email: input.email,
    },
    role: input.role,
  }
}
