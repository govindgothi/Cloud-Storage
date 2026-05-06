export const avatarColors: Record<
  string,
  { bg: string; color: string }
> = {
  A: { bg: "FF6B6B", color: "FFFFFF" },
  B: { bg: "6BCB77", color: "FFFFFF" },
  C: { bg: "4D96FF", color: "FFFFFF" },
  D: { bg: "FFD93D", color: "333333" },
  E: { bg: "845EC2", color: "FFFFFF" },
  F: { bg: "FF9671", color: "FFFFFF" },
  G: { bg: "00C9A7", color: "FFFFFF" },
  H: { bg: "C34A36", color: "FFFFFF" },
  I: { bg: "2C73D2", color: "FFFFFF" },
  J: { bg: "0081CF", color: "FFFFFF" },
  K: { bg: "B39CD0", color: "333333" },
  L: { bg: "F9F871", color: "333333" },
  M: { bg: "FF8066", color: "FFFFFF" },
  N: { bg: "00C2A8", color: "FFFFFF" },
  O: { bg: "4B4453", color: "FFFFFF" },
  P: { bg: "FF5E78", color: "FFFFFF" },
  Q: { bg: "008E9B", color: "FFFFFF" },
  R: { bg: "FFC75F", color: "333333" },
  S: { bg: "F6416C", color: "FFFFFF" },
  T: { bg: "00B8A9", color: "FFFFFF" },
  U: { bg: "6A67CE", color: "FFFFFF" },
  V: { bg: "FF9671", color: "FFFFFF" },
  W: { bg: "2C2C54", color: "FFFFFF" },
  X: { bg: "00A8CC", color: "FFFFFF" },
  Y: { bg: "FFAA5A", color: "333333" },
  Z: { bg: "9B5DE5", color: "FFFFFF" },
};

export const getProfileUrl = (username:string)=>{
  const letter = username.charAt(0)?.toUpperCase() || "A";
  const {bg,color} =  avatarColors[letter] || avatarColors["A"];
  let url = `${process.env.PROFILE_BASE_URL}name=${letter}&background=${bg}&color=${color}&size=128`
  return url
}