package data

import (
	"bytes"
	"strings"
	"testing"
)

func raw(t *testing.T, name string) []byte {
	t.Helper()
	b, err := v1FS.ReadFile("v1/" + name)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

func TestLoadV1Counts(t *testing.T) {
	c, err := LoadV1()
	if err != nil {
		t.Fatal(err)
	}
	if len(c.Categories) != 5 || len(c.Tactics) != 8 || len(c.Scenarios) != 10 {
		t.Fatalf("jumlah salah: %d/%d/%d", len(c.Categories), len(c.Tactics), len(c.Scenarios))
	}
	flaws, options := 0, 0
	for _, s := range c.Scenarios {
		flaws += len(s.Flaws)
		for _, q := range s.Questions {
			options += len(q.Options)
		}
	}
	if flaws != 40 || options != 150 {
		t.Errorf("mau 40 celah dan 150 opsi, dapat %d dan %d", flaws, options)
	}
}

func TestV1NoForbiddenWords(t *testing.T) {
	for _, f := range []string{"categories.json", "tactics.json", "scenarios.json", "characters.json"} {
		low := strings.ToLower(string(raw(t, f)))
		for _, w := range []string{"tingkat bahaya", "skor", "persen", "jnt", "jne", "sicepat", "bumble", "tinder", "google", "youtube", "telegram", "bca"} {
			if strings.Contains(low, w) {
				t.Errorf("%s memuat kata terlarang %q", f, w)
			}
		}
	}
}

func TestParseV1Broken(t *testing.T) {
	cats, tacs, scs, chars := raw(t, "categories.json"), raw(t, "tactics.json"), raw(t, "scenarios.json"), raw(t, "characters.json")
	cases := []struct {
		name string
		edit func() (c, t, s, ch []byte)
		want string
	}{
		{"kategori salah", func() ([]byte, []byte, []byte, []byte) {
			return bytes.Replace(cats, []byte(`"giveaway"`), []byte(`"hadiah"`), 1), tacs, scs, chars
		}, "tidak dikenal"},
		{"taktik tidak valid", func() ([]byte, []byte, []byte, []byte) {
			return cats, tacs, bytes.Replace(scs, []byte(`"tactic": "urgency"`), []byte(`"tactic": "ngawur"`), 1), chars
		}, "taktik"},
		{"id skenario ganda", func() ([]byte, []byte, []byte, []byte) {
			return cats, tacs, bytes.Replace(scs, []byte(`"id": "task_scam_review_maps"`), []byte(`"id": "wfh_admin_fee"`), 1), chars
		}, "ganda"},
		{"opsi tanpa tag", func() ([]byte, []byte, []byte, []byte) {
			broken := bytes.Replace(scs, []byte("\"tags\": [\n              \"imbalan_berlebihan\"\n            ]"), []byte(`"tags": []`), 1)
			if bytes.Equal(broken, scs) {
				t.Fatal("fixture rusak tidak berubah")
			}
			return cats, tacs, broken, chars
		}, "tags wajib"},
		{"fallback ganda", func() ([]byte, []byte, []byte, []byte) {
			return cats, tacs, bytes.Replace(scs, []byte(`"is_fallback": false`), []byte(`"is_fallback": true`), 1), chars
		}, "fallback"},
		{"nama karakter berangka", func() ([]byte, []byte, []byte, []byte) {
			return cats, tacs, scs, bytes.Replace(chars, []byte(`"Nadia"`), []byte(`"Nadia2"`), 1)
		}, "nama bawaan"},
		{"json rusak", func() ([]byte, []byte, []byte, []byte) { return cats, tacs, []byte(`[{`), chars }, "scenarios.json"},
	}
	for _, c := range cases {
		a, b, s, ch := c.edit()
		_, err := ParseV1(a, b, s, ch)
		if err == nil || !strings.Contains(err.Error(), c.want) {
			t.Errorf("%s: mau error memuat %q, dapat %v", c.name, c.want, err)
		}
	}
}
