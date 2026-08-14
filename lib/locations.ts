export const provinces = [
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Free State",
  "Northern Cape",
]

export const citiesByProvince: { [key: string]: string[] } = {
  "Gauteng": ["Johannesburg", "Pretoria", "Sandton", "Soweto", "Midrand", "Centurion"],
  "Western Cape": ["Cape Town", "Stellenbosch", "George", "Paarl", "Hermanus"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Umhlanga", "Ballito", "Richards Bay"],
  "Eastern Cape": ["Port Elizabeth", "East London", "Grahamstown", "Jeffreys Bay"],
  "Limpopo": ["Polokwane", "Mokopane", "Thohoyandou"],
  "Mpumalanga": ["Nelspruit", "Witbank", "Secunda"],
  "North West": ["Rustenburg", "Potchefstroom", "Klerksdorp"],
  "Free State": ["Bloemfontein", "Welkom", "Bethlehem"],
  "Northern Cape": ["Kimberley", "Upington", "Springbok"],
}
