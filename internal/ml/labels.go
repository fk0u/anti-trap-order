package ml

var CategoryIDs = []string{"tawaran_kerja", "giveaway", "akun_menyamar", "pinjaman_investasi", "lainnya"}

var TacticIDs = []string{"urgency", "upfront_fee", "impersonation", "isolation", "too_good", "credential_request", "link_or_apk", "authority"}

func in(list []string, s string) bool {
	for _, x := range list {
		if x == s {
			return true
		}
	}
	return false
}

func ValidCategory(s string) bool { return in(CategoryIDs, s) }
func ValidTactic(s string) bool   { return in(TacticIDs, s) }
