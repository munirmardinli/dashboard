"use client";

import { usePortfolioData } from "@/hooks/usePortfolioData";

export default function CVView() {
  const { data } = usePortfolioData();
  const profile = data?.profile;
  const experiences = data?.experiences ?? [];
  const education = data?.education ?? [];
  const technicalSkills = data?.skills.technicalSkills ?? [];
  const mediaCompetence = data?.skills.mediaCompetence ?? [];
  const socialCompetence = data?.skills.socialCompetence ?? [];
  const languages = data?.languages ?? [];
  const contact = data?.contact;

  return (
    <div className="cv-container" style={{
      width: '210mm',
      minHeight: '297mm',
      margin: '0 auto',
      padding: '20mm',
      backgroundColor: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      color: '#1a1a1a'
    }}>
      <header style={{
        borderBottom: '2px solid #2563eb',
        paddingBottom: '15px',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '28pt',
          fontWeight: 'bold',
          margin: '0 0 5px 0',
          color: '#1a1a1a'
        }}>
          {profile?.name ?? ""}
        </h1>
        <p style={{
          fontSize: '14pt',
          color: '#4b5563',
          margin: '0 0 10px 0'
        }}>
          {profile?.title ?? ""}
        </p>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          fontSize: '10pt',
          color: '#6b7280'
        }}>
          {contact?.email && (
            <span>📧 {contact.email}</span>
          )}
          {contact?.location && (
            <span>📍 {contact.location}</span>
          )}
          {contact?.social?.linkedin && (
            <span>💼 LinkedIn</span>
          )}
          {contact?.social?.github && (
            <span>💻 GitHub</span>
          )}
        </div>
      </header>

      {profile?.bio && (
        <section style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#1a1a1a',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '5px'
          }}>
            Über mich
          </h2>
          <p style={{
            textAlign: 'justify',
            margin: 0
          }}>
            {profile.bio}
          </p>
        </section>
      )}

      {experiences && experiences.length > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#1a1a1a',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '5px'
          }}>
            Berufserfahrung
          </h2>
          {experiences.map((exp, index) => (
            <div key={index} style={{
              marginBottom: '15px',
              pageBreakInside: 'avoid'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '5px'
              }}>
                <div>
                  <h3 style={{
                    fontSize: '13pt',
                    fontWeight: 'bold',
                    margin: '0 0 3px 0'
                  }}>
                    {exp.position}
                  </h3>
                  <p style={{
                    fontSize: '11pt',
                    color: '#4b5563',
                    margin: '0 0 3px 0'
                  }}>
                    {exp.company}
                  </p>
                </div>
                <span style={{
                  fontSize: '10pt',
                  color: '#6b7280',
                  whiteSpace: 'nowrap'
                }}>
                  {exp.period}
                </span>
              </div>
              {exp.description && (
                <p style={{
                  fontSize: '10pt',
                  margin: '5px 0 0 0',
                  textAlign: 'justify'
                }}>
                  {exp.description}
                </p>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul style={{
                  fontSize: '10pt',
                  margin: '5px 0 0 0',
                  paddingLeft: '20px',
                  listStyleType: 'disc'
                }}>
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} style={{ marginBottom: '3px' }}>
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {education && education.length > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#1a1a1a',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '5px'
          }}>
            Bildung
          </h2>
          {education.map((edu, index) => {
            const getEducationTitle = (description: string): string => {
              if (description.includes('Gymnasium')) {
                return 'Berufliches Gymnasium';
              }
              if (description.includes('Fachoberschulreife')) {
                return 'Fachoberschulreife';
              }
              if (description.includes('Integrationskurs')) {
                return 'Integrationskurs';
              }
              if (description.includes('Orientierungskurs')) {
                return 'Orientierungskurs';
              }
              if (description.includes('Grund- und Mittelschule')) {
                return 'Grund- und Mittelschule';
              }
              if (description.includes('Berufskolleg')) {
                const match = description.match(/([^,]+Berufskolleg[^,]*)/);
                if (match) return match[1].trim();
              }
              const firstPart = description.split(',')[0] || description.split('.')[0];
              return firstPart.length > 50 ? firstPart.substring(0, 50) + '...' : firstPart;
            };

            const educationTitle = getEducationTitle(edu.description);

            return (
              <div key={index} style={{
                marginBottom: '15px',
                pageBreakInside: 'avoid'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '5px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      margin: '0 0 3px 0'
                    }}>
                      {educationTitle}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: '10pt',
                    color: '#6b7280',
                    whiteSpace: 'nowrap',
                    marginLeft: '10px'
                  }}>
                    {edu.period}
                  </span>
                </div>
                {edu.description && (
                  <p style={{
                    fontSize: '10pt',
                    margin: '5px 0 0 0',
                    textAlign: 'justify'
                  }}>
                    {edu.description}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {technicalSkills && technicalSkills.length > 0 && (
          <section style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '16pt',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#1a1a1a',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '5px'
            }}>
              Technische Skills
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {technicalSkills.map((skill, index) => (
                <span key={index} style={{
                  fontSize: '10pt',
                  padding: '4px 8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  display: 'inline-block'
                }}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages && languages.length > 0 && (
          <section style={{ flex: 1 }}>
            <h2 style={{
              fontSize: '16pt',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#1a1a1a',
              borderBottom: '1px solid #e5e7eb',
              paddingBottom: '5px'
            }}>
              Sprachen
            </h2>
            {languages.map((lang, index) => (
              <div key={index} style={{
                marginBottom: '8px',
                fontSize: '10pt'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '3px'
                }}>
                  <span style={{ fontWeight: '600' }}>{lang.name}</span>
                  <span style={{ color: '#6b7280' }}>{lang.level}</span>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {(mediaCompetence && mediaCompetence.length > 0) || (socialCompetence && socialCompetence.length > 0) && (
        <section style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#1a1a1a',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '5px'
          }}>
            Kompetenzen
          </h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            {mediaCompetence && mediaCompetence.length > 0 && (
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '12pt',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Medienkompetenz
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {mediaCompetence.map((skill, index) => (
                    <span key={index} style={{
                      fontSize: '10pt',
                      padding: '4px 8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {socialCompetence && socialCompetence.length > 0 && (
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '12pt',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  Sozialkompetenz
                </h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  {socialCompetence.map((skill, index) => (
                    <span key={index} style={{
                      fontSize: '10pt',
                      padding: '4px 8px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
