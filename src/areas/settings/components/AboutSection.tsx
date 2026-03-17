import { Section, Card, Row, LinkButton } from '@shared/ui'

export function AboutSection(): JSX.Element {
  return (
    <Section title="About" subtitle="Application information and useful resources.">
      <div className="grid grid-cols-2 gap-4">

        <Card>
          <Row label="Modly" description="Local 3D mesh generation app.">
            <span className="text-xs font-mono text-zinc-400">v0.1.0</span>
          </Row>
          <Row label="Documentation" description="Guides and API reference.">
            <LinkButton label="Open" />
          </Row>
          <Row label="GitHub" description="Source code and issues.">
            <LinkButton label="Open" />
          </Row>
        </Card>

        <Card>
          <Row label="Discord" description="Community support.">
            <LinkButton label="Join" />
          </Row>
          <Row label="Open-source licenses" description="Third-party licenses used in this app.">
            <LinkButton label="View" />
          </Row>
        </Card>

      </div>
    </Section>
  )
}
