package ml

import (
	"regexp"
	"strings"
	"unicode"
)

// TokenizerVersion naik jika aturan tokenisasi atau slang berubah; model.json harus dilatih ulang.
const TokenizerVersion = 1

var specialTokens = map[string]bool{
	"<nomor>": true, "<url>": true, "<rekening>": true, "<email>": true,
	"<uang>": true, "<angka>": true, "<seru>": true,
}

var (
	moneyRe = regexp.MustCompile(`rp\.?\s?\d[\d.,]*(\s?(rb|ribu|k|jt|juta|jutaan|m|miliar))?\b|\b\d[\d.,]*\s?(rb|ribu|k|jt|juta|jutaan|miliar)\b`)
	digitRe = regexp.MustCompile(`\d+`)
	boomRe  = regexp.MustCompile(`!{2,}`)
)

// collapseRepeats mengubah huruf yang sama 3x atau lebih berturut-turut menjadi satu.
func collapseRepeats(s string) string {
	rs := []rune(s)
	var b strings.Builder
	for i := 0; i < len(rs); {
		j := i
		for j < len(rs) && rs[j] == rs[i] {
			j++
		}
		if unicode.IsLetter(rs[i]) && j-i >= 3 {
			b.WriteRune(rs[i])
		} else {
			b.WriteString(string(rs[i:j]))
		}
		i = j
	}
	return b.String()
}

// Normalize: teks mentah -> daftar kata ternormalisasi (tanpa bigram).
func Normalize(text string) []string {
	s := strings.ToLower(text)
	s = moneyRe.ReplaceAllString(s, " <uang> ")
	s = digitRe.ReplaceAllString(s, " <angka> ")
	s = boomRe.ReplaceAllString(s, " <seru> ")
	s = collapseRepeats(s)
	s = strings.Map(func(r rune) rune {
		if unicode.IsLetter(r) || r == '<' || r == '>' || unicode.IsSpace(r) {
			return r
		}
		return ' '
	}, s)
	var out []string
	for _, raw := range strings.Fields(s) {
		if specialTokens[raw] {
			out = append(out, raw)
			continue
		}
		w := strings.NewReplacer("<", "", ">", "").Replace(raw)
		if w == "" {
			continue
		}
		if v, ok := Slang[w]; ok {
			w = v
		}
		out = append(out, w)
	}
	return out
}

// Tokenize: unigram lalu bigram (a_b).
func Tokenize(text string) []string {
	w := Normalize(text)
	out := append([]string{}, w...)
	for i := 0; i+1 < len(w); i++ {
		out = append(out, w[i]+"_"+w[i+1])
	}
	return out
}
