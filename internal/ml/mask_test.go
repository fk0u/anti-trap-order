package ml

import "testing"

func TestMask(t *testing.T) {
	got, n := Mask("hub 081234567890 / +6281298765432, email a.b@contoh.id, buka https://contoh-palsu.id/x rek 1234567890")
	want := "hub <NOMOR> / <NOMOR>, email <EMAIL>, buka <URL> rek <REKENING>"
	if n != 5 || got != want {
		t.Errorf("got %q (%d)", got, n)
	}
}
