export const roleLabels = {
  student: 'Student',
  technician: 'Technician',
  advisor: 'Advisor',
  dean: 'Dean',
}

export function translatedRoleLabel(t, role) {
  return t(`roles.${role}`)
}
