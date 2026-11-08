package ml

import "regexp"

var maskRules = []struct {
	re  *regexp.Regexp
	tok string
}{
	{regexp.MustCompile(`\b[\w.+-]+@[\w-]+\.[\w.]+\b`), "<EMAIL>"},
	{regexp.MustCompile(`(?i)\bhttps?://\S+|\bwww\.\S+`), "<URL>"},
	{regexp.MustCompile(`(\+62|62|0)8[\d\s-]{7,13}\d`), "<NOMOR>"},
	{regexp.MustCompile(`\b\d{8,16}\b`), "<REKENING>"},
}

// Mask menyamarkan email, URL, nomor HP, dan rekening; aturan dan urutan sama dengan maskText di contract.ts.
func Mask(s string) (string, int) {
	n := 0
	for _, r := range maskRules {
		s = r.re.ReplaceAllStringFunc(s, func(string) string { n++; return r.tok })
	}
	return s, n
}
