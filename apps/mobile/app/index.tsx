import { performCast } from "@iching-oracle/iching-engine";
import { commonStrings, DEFAULT_LOCALE } from "@iching-oracle/i18n";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function HomeScreen() {
  const t = commonStrings[DEFAULT_LOCALE];
  const [q, setQ] = useState("");
  const [summary, setSummary] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t.appTitle}</Text>
      <TextInput
        style={styles.input}
        placeholder="Tu pregunta…"
        placeholderTextColor="#666"
        value={q}
        onChangeText={setQ}
        multiline
      />
      <Button
        title={t.consult}
        onPress={() => {
          const cast = performCast(q.trim() || "Silent consultation", DEFAULT_LOCALE);
          setSummary(
            `#${cast.primaryHexagram.number} ${cast.primaryHexagram.name} — ${cast.mutationRule}`,
          );
        }}
      />
      {summary ? <Text style={styles.meta}>{summary}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0c0f14" },
  title: { fontSize: 22, color: "#c9a227", marginBottom: 16, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#e8e6e3",
    minHeight: 100,
    marginBottom: 12,
  },
  meta: { marginTop: 20, color: "#aaa", fontSize: 14 },
});
