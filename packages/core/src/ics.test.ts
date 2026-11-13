import { describe, expect, it } from "vitest";
import { toICS, type StayPass } from "./index";

type IcsProp = { name: string; value: string; raw: string };
type IcsComponent = {
  name: string;
  props: IcsProp[];
  children: IcsComponent[];
};

const encoder = new TextEncoder();

const pass = (overrides: Partial<StayPass> = {}): StayPass => ({
  id: "pass-1",
  checkIn: new Date("2026-11-01T15:00:00.000Z"),
  checkOut: new Date("2026-11-04T11:00:00.000Z"),
  location: "La Casa de Barra",
  arrivalInstructions: "Use the side gate. Ask for Frisky.",
  dtstamp: new Date("2026-10-14T17:00:00.000Z"),
  summary: "Stay at La Casa de Barra",
  ...overrides,
});

function unescapeText(value: string): string {
  let out = "";
  for (let i = 0; i < value.length; i++) {
    if (value[i] === "\\" && i + 1 < value.length) {
      const next = value[i + 1];
      if (next === "n" || next === "N") out += "\n";
      else if (next === "\\") out += "\\";
      else if (next === ";") out += ";";
      else if (next === ",") out += ",";
      else out += next;
      i += 1;
      continue;
    }
    out += value[i];
  }
  return out;
}

/** Unfold CRLF folds and read exactly one VCALENDAR containing one VEVENT. */
function parseCalendar(ics: string): IcsComponent {
  expect(ics.endsWith("\r\n")).toBe(true);
  expect(ics).not.toMatch(/[^\r]\n/);
  const physical = ics.slice(0, -"\r\n".length).split("\r\n");
  for (const line of physical) {
    expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
  }

  const logical: string[] = [];
  for (const line of physical) {
    if (line.startsWith(" ") || line.startsWith("\t")) {
      expect(logical.length).toBeGreaterThan(0);
      logical[logical.length - 1] += line.slice(1);
    } else {
      expect(line.length).toBeGreaterThan(0);
      logical.push(line);
    }
  }

  const root: IcsComponent = { name: "ROOT", props: [], children: [] };
  const stack = [root];
  for (const line of logical) {
    if (line.startsWith("BEGIN:")) {
      const child: IcsComponent = {
        name: line.slice("BEGIN:".length),
        props: [],
        children: [],
      };
      stack[stack.length - 1].children.push(child);
      stack.push(child);
      continue;
    }
    if (line.startsWith("END:")) {
      const current = stack.pop();
      expect(current?.name).toBe(line.slice("END:".length));
      continue;
    }
    const colon = line.indexOf(":");
    expect(colon).toBeGreaterThan(0);
    const left = line.slice(0, colon);
    stack[stack.length - 1].props.push({
      name: left.split(";")[0],
      value: line.slice(colon + 1),
      raw: line,
    });
  }
  expect(stack).toEqual([root]);
  expect(root.children.map(child => child.name)).toEqual(["VCALENDAR"]);
  const calendar = root.children[0];
  expect(calendar.children.map(child => child.name)).toEqual(["VEVENT"]);
  return calendar;
}

function textProp(component: IcsComponent, name: string): string {
  const found = component.props.filter(prop => prop.name === name);
  expect(found).toHaveLength(1);
  return unescapeText(found[0].value);
}

function rawProp(component: IcsComponent, name: string): string {
  const found = component.props.filter(prop => prop.name === name);
  expect(found).toHaveLength(1);
  return found[0].raw;
}

describe("toICS", () => {
  it("parses as one VCALENDAR with one UTC VEVENT", () => {
    const ics = toICS(pass());
    const calendar = parseCalendar(ics);
    const event = calendar.children[0];

    expect(textProp(calendar, "VERSION")).toBe("2.0");
    expect(event.props.find(prop => prop.name === "UID")?.value).toBe("pass-1");
    expect(rawProp(event, "DTSTAMP")).toBe("DTSTAMP:20261014T170000Z");
    expect(rawProp(event, "DTSTART")).toBe("DTSTART:20261101T150000Z");
    expect(rawProp(event, "DTEND")).toBe("DTEND:20261104T110000Z");
    expect(textProp(event, "LOCATION")).toBe("La Casa de Barra");
    expect(textProp(event, "DESCRIPTION")).toBe(
      "Use the side gate. Ask for Frisky."
    );
    expect(textProp(event, "SUMMARY")).toBe("Stay at La Casa de Barra");
  });

  it("escapes commas, semicolons, backslashes, and newlines in text values", () => {
    const location = "Casa; Norte, Suite\\B\nLower";
    const arrivalInstructions =
      "Ring once; if no answer, use the alley, then\nwait.";
    const summary = "Stay at Casa; Norte, Suite\\B";
    const calendar = parseCalendar(
      toICS(pass({ location, arrivalInstructions, summary }))
    );
    const event = calendar.children[0];

    expect(textProp(event, "LOCATION")).toBe(location);
    expect(textProp(event, "DESCRIPTION")).toBe(arrivalInstructions);
    expect(textProp(event, "SUMMARY")).toBe(summary);
    const unfolded = toICS(
      pass({ location, arrivalInstructions, summary })
    ).replace(/\r\n[ \t]/g, "");
    expect(unfolded).toContain("LOCATION:Casa\\; Norte\\, Suite\\\\B\\nLower");
    expect(unfolded).toContain("SUMMARY:Stay at Casa\\; Norte\\, Suite\\\\B");
  });

  it("folds lines at 75 octets without splitting a multi-byte character", () => {
    const location = `Hacienda ${"í".repeat(80)}`;
    const arrivalInstructions = `Side gate, ${"a".repeat(180)}; then the blue door.`;
    const ics = toICS(pass({ location, arrivalInstructions }));
    const event = parseCalendar(ics).children[0];

    expect(ics).toContain("\r\n ");
    expect(textProp(event, "LOCATION")).toBe(location);
    expect(textProp(event, "DESCRIPTION")).toBe(arrivalInstructions);
    for (const line of ics.split("\r\n")) {
      if (line.length === 0) continue;
      expect(encoder.encode(line).length).toBeLessThanOrEqual(75);
      expect(line).not.toMatch(/[\uFFFD]/);
    }
  });

  it("emits TZID local times and keeps DTSTAMP in UTC", () => {
    const calendar = parseCalendar(
      toICS(pass({ timeZone: "America/Mexico_City" }))
    );
    const event = calendar.children[0];
    expect(rawProp(event, "DTSTAMP")).toBe("DTSTAMP:20261014T170000Z");
    expect(rawProp(event, "DTSTART")).toBe(
      "DTSTART;TZID=America/Mexico_City:20261101T090000"
    );
    expect(rawProp(event, "DTEND")).toBe(
      "DTEND;TZID=America/Mexico_City:20261104T050000"
    );
  });

  it("rejects a stay whose check-out does not follow check-in", () => {
    const checkIn = new Date("2026-11-01T15:00:00.000Z");
    expect(() => toICS(pass({ checkIn, checkOut: checkIn }))).toThrow(
      "check-out"
    );
    expect(() =>
      toICS(pass({ checkIn, checkOut: new Date(checkIn.getTime() - 1) }))
    ).toThrow("check-out");
  });
});
