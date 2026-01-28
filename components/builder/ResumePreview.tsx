'use client';

import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { type ResumeData } from './ResumeForm';
import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

// Create styles
const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 11, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, textAlign: 'center' },
    name: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    subHeader: { fontSize: 10, color: '#666', marginBottom: 5 },
    section: { marginVertical: 10 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 6, paddingBottom: 2, textTransform: 'uppercase' },
    item: { marginBottom: 8 },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
    company: { fontWeight: 'bold' },
    date: { color: '#666', fontSize: 10 },
    role: { fontStyle: 'italic', marginBottom: 2 },
    description: { lineHeight: 1.4 },
    skills: { lineHeight: 1.4 },
});

// PDF Document Component
const ResumePDF = ({ data }: { data: ResumeData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.name}>{data.fullName}</Text>
                <Text style={styles.subHeader}>
                    {data.email} {data.phone ? `| ${data.phone}` : ''} {data.linkedin ? `| ${data.linkedin}` : ''}
                </Text>
                <Text style={styles.subHeader}>{data.portfolio}</Text>
            </View>

            {/* Summary */}
            {data.summary && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Summary</Text>
                    <Text style={{ lineHeight: 1.5 }}>{data.summary}</Text>
                </View>
            )}

            {/* Experience */}
            {data.experience.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {data.experience.map((exp, i) => (
                        <View key={i} style={styles.item}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.company}>{exp.company}</Text>
                                <Text style={styles.date}>{exp.startDate} - {exp.endDate}</Text>
                            </View>
                            <Text style={styles.role}>{exp.role}</Text>
                            <Text style={styles.description}>{exp.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {data.education.map((edu, i) => (
                        <View key={i} style={styles.item}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.company}>{edu.school}</Text>
                                <Text style={styles.date}>{edu.startDate} - {edu.endDate}</Text>
                            </View>
                            <Text style={styles.role}>{edu.degree}</Text>
                            <Text style={styles.description}>{edu.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Projects</Text>
                    {data.projects.map((proj, i) => (
                        <View key={i} style={styles.item}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.company}>{proj.title}</Text>
                                <Text style={styles.date}>{proj.link}</Text>
                            </View>
                            <Text style={styles.role}>{proj.techStack}</Text>
                            <Text style={styles.description}>{proj.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Certifications</Text>
                    {data.certifications.map((cert, i) => (
                        <View key={i} style={styles.item}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.company}>{cert.name}</Text>
                                <Text style={styles.date}>{cert.date}</Text>
                            </View>
                            <Text style={styles.role}>{cert.issuer}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Skills */}
            {data.skills && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <Text style={styles.skills}>{data.skills}</Text>
                </View>
            )}
        </Page>
    </Document>
);

interface ResumePreviewProps {
    data: ResumeData;
}

export function ResumePreview({ data }: ResumePreviewProps) {
    const [atsMode, setAtsMode] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return <div className="flex h-full items-center justify-center">Loading Preview...</div>;

    return (
        <div className="flex h-full flex-col bg-muted/30">
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b bg-background px-4 py-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Live Preview
                </h2>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium ${atsMode ? 'text-primary' : 'text-muted-foreground'}`}>ATS Mode</span>
                    <button
                        onClick={() => setAtsMode(!atsMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${atsMode ? 'bg-primary' : 'bg-input'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${atsMode ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {atsMode ? (
                    // ATS Text Mode
                    <div className="h-full overflow-y-auto p-8 font-mono text-sm bg-white text-black whitespace-pre-wrap leading-relaxed shadow-inner">
                        {`NAME: ${data.fullName}
CONTACT: ${data.email} | ${data.phone} | ${data.linkedin}
URL: ${data.portfolio}

SUMMARY
====================================
${data.summary}

EXPERIENCE
====================================
${data.experience.map(exp => `
${exp.company.toUpperCase()} | ${exp.role}
${exp.startDate} - ${exp.endDate}
${exp.description}
`).join('\n')}

SKILLS
====================================
${data.skills}

EDUCATION
====================================
${data.education?.map(edu => `
${edu.school.toUpperCase()} | ${edu.degree}
${edu.startDate} - ${edu.endDate}
${edu.description}
`).join('\n') || ''}

PROJECTS
====================================
${data.projects?.map(proj => `
${proj.title.toUpperCase()} | ${proj.techStack}
Link: ${proj.link}
${proj.description}
`).join('\n') || ''}

CERTIFICATIONS
====================================
${data.certifications?.map(cert => `
${cert.name.toUpperCase()} | ${cert.issuer}
Date: ${cert.date}
`).join('\n') || ''}
`}
                    </div>
                ) : (
                    // PDF Mode
                    <PDFViewer className="h-full w-full border-none">
                        <ResumePDF data={data} />
                    </PDFViewer>
                )}
            </div>
        </div>
    );
}
