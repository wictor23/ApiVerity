const pendentes = []

export const registrar = (id) => {
  if (id && !pendentes.includes(id)) {
    pendentes.push(id)
  }
}

export const descartar = (id) => {
  const posicao = pendentes.indexOf(id)

  if (posicao >= 0) {
    pendentes.splice(posicao, 1)
  }
}

export const consumir = () => pendentes.splice(0, pendentes.length)
