# Development Workflow

Her emir alındığında bu iş akışını sırasıyla uygula.

## 1. Branch Açma

```bash
# Yeni iş için dev'den branch aç
git checkout dev
git pull origin dev
git checkout -b <branch-adi>
```

Branch adlandırma:
- `feat/<kısa-acıklama>` — yeni özellik
- `fix/<kısa-acıklama>` — hata düzeltme
- `refactor/<kısa-acıklama>` — yeniden yapılandırma
- `chore/<kısa-acıklama>` — diğer işler

## 2. Task Oluşturma

Her alt görev için `TaskCreate` ile task oluştur ve agent ata:

| Görev | Agent |
|-------|-------|
| UI/widget geliştirme | `rn-developer` |
| TypeScript / domain katmanı | `ts-developer` |
| Test yazma | `test-developer` |
| Kod review | `code-reviewer` |
| Tasarım kararları | `ui-designer` |

```bash
# Task oluştur örneği
TaskCreate: "Login ekranı UI geliştirmesi", assignee: "rn-developer"
```

## 3. Çalışma

1. İlgili agent'lara TaskCreate ile işleri ata
2. Agent'lar işleri tamamlar
3. Düzenli olarak `git add` + `git commit` yap
4. Commit mesajları anlaşılır ve atomic olsun

## 4. Code Review (Mergeden Önce)

İş bitiminde, dev'e göndermeden önce:

```bash
# code-reviewer agent'ı çağır
Agent(subagent_type: "code-reviewer", prompt: "...")
```

Code-reviewer kontrol edecek:
- DDD / Clean Architecture kuralları
- TypeScript strictness
- Katmanlar arası importlar (dependency rule)
- Eksik hata yönetimi
- Tekrar eden kod
- Test coverage

### Geri Dönüş
- Agent sorun bulursa → ilgili task'a yaz → agent'a düzeltttiğini yaptır → tekrar review'e gönder
- Sorun yoksa → devam et

## 5. Dev'e Gönderme

```bash
# Review geçti, dev'e push et
git push origin <branch-adi>
```

## 6. Merge

PR aç ve kontrol et, ardından:

```bash
# Dev ile senkronize et (gerekirse resolve conflict)
git checkout dev
git pull origin dev
git merge <branch-adi>

# Conflict varsa çöz, sonra commit
git push origin dev
```

## 7. Branch Temizliği

```bash
# Merge tamamlandıktan sonra local branch'i sil
git branch -d <branch-adi>
```

---

## Kurallar

- **Dependency rule**: Katmanlar sadece aşağıya import eder, yukarıya asla
- **Error handling**: `Result<T, Failure>` kullan, exception fırlatma
- **Test**: Domain/infrastructure değişikliklerinde `test-developer` ile test yaz
- **Build**: İş tamamlandığında yerel build çalışsın (`npx expo export --platform web`)
- **Lint**: `npm run lint` ve `npx tsc --noEmit` hatasız olsun

## İletişim

- Branch açılırken `dev` base alınır
- Tüm PR'lar `dev`'e gider, `main` sadece release için kullanılır
