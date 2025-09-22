export function jsonError(error: string, code = 400, init?: ResponseInit) {
  return Response.json({ error, code }, { status: code, ...(init || {}) })
}

export function badRequest(error: string) {
  return jsonError(error, 400)
}

export function unauthorized(error = 'Unauthorized') {
  return jsonError(error, 401)
}

export function forbidden(error = 'Forbidden') {
  return jsonError(error, 403)
}

export function notFound(error = 'Not Found') {
  return jsonError(error, 404)
}

export function serverError(error = 'Internal Server Error') {
  return jsonError(error, 500)
}


