package ml

import (
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

func eq(t *testing.T, got, want []string) {
	t.Helper()
	if len(got) == 0 && len(want) == 0 {
		return
	}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("got %q want %q", got, want)
	}
}

func TestNormalize(t *testing.T) {
	cases := []struct {
		in   string
		want []string
	}{
		{"biaya 150rb", []string{"biaya", "<uang>"}},
		{"Rp150.000 saja", []string{"<uang>", "saja"}},
		{"gaji 1,5jt", []string{"gaji", "<uang>"}},
		{"hadiah 2 juta", []string{"hadiah", "<uang>"}},
		{"dalam 24 jam", []string{"dalam", "<angka>", "jam"}},
		{"BURUAAAN!!!", []string{"segera", "<seru>"}},
		{"oke!", []string{"oke"}},
		{"klik <URL> atau hub <NOMOR>", []string{"link", "<url>", "atau", "hub", "<nomor>"}},
		{"tf dulu yg 😀 ke rek, kak.", []string{"transfer", "dulu", "yang", "ke", "rekening", "kakak"}},
	}
	for _, c := range cases {
		eq(t, Normalize(c.in), c.want)
	}
}

func TestBigram(t *testing.T) {
	eq(t, Tokenize("biaya seragam dulu"), []string{"biaya", "seragam", "dulu", "biaya_seragam", "seragam_dulu"})
}

func TestFixture(t *testing.T) {
	b, err := os.ReadFile("../../testdata/fixtures/ml-tokenize.json")
	if err != nil {
		t.Fatal(err)
	}
	var cases []struct {
		Text   string   `json:"text"`
		Tokens []string `json:"tokens"`
	}
	if err := json.Unmarshal(b, &cases); err != nil {
		t.Fatal(err)
	}
	if len(cases) < 15 {
		t.Fatal("fixture terlalu sedikit")
	}
	for _, c := range cases {
		eq(t, Tokenize(c.Text), c.Tokens)
	}
}
