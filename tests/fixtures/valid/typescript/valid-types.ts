type User = {
  id: string
  name?: string
}

function getDisplayName(user: User) {
  return user.name?.toUpperCase() ?? user.id
}

export { getDisplayName }
