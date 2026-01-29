'use client';

import { PDFViewer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { type ResumeData } from './ResumeForm';
import { useState, useEffect } from 'react';
import { Eye, Info } from 'lucide-react';

// Create styles
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
        lineHeight: 1.6,
        color: '#1e293b' // Dark Slate
    },
    header: {
        marginBottom: 24,
        textAlign: 'center',
        borderBottomWidth: 0,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2563eb', // Royal Blue
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    contactRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 10,
        color: '#64748b', // Gray
        flexWrap: 'wrap',
        gap: 8
    },
    section: {
        marginBottom: 10,
        marginTop: 15
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563eb', // Royal Blue
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        marginBottom: 10,
        paddingBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    item: {
        marginBottom: 8
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
        alignItems: 'flex-start'
    },
    company: {
        fontWeight: 'bold',
        fontSize: 11,
        color: '#1e293b'
    },
    date: {
        color: '#64748b',
        fontSize: 10,
        fontStyle: 'italic'
    },
    role: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#334155'
    },
    description: {
        fontSize: 10,
        lineHeight: 1.6,
        color: '#334155'
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2
    },
    bullet: {
        width: 10,
        fontSize: 10,
        color: '#2563eb'
    },
    bulletContent: {
        flex: 1,
        fontSize: 10
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6
    },
    skillBadge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        fontSize: 9,
        color: '#334151'
    }
});

// Helper for bullet points
const BulletPoint = ({ children }: { children: string }) => (
    <View style={styles.bulletPoint}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletContent}>{children}</Text>
    </View>
);

// PDF Document Component
const ResumePDF = ({ data }: { data: ResumeData }) => {
    // Helper to join contact info with simpler logic
    const contactItems = [
        data.email,
        data.phone,
        data.linkedin,
        data.portfolio
    ].filter(Boolean);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.fullName}</Text>
                    <View style={styles.contactRow}>
                        {contactItems.map((item, index) => (
                            <Text key={index}>
                                {item}
                                {index < contactItems.length - 1 ? '  |  ' : ''}
                            </Text>
                        ))}
                    </View>
                </View>

                {/* Summary */}
                {data.summary && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Professional Summary</Text>
                        <Text style={styles.description}>{data.summary}</Text>
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

                {/* Certifications (Compact) */}
                {data.certifications && data.certifications.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {data.certifications.map((cert, i) => (
                            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#1e293b' }}>{cert.name}</Text>
                                <Text style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic' }}>{cert.issuer} ({cert.date})</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {data.skills && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsContainer}>
                            {data.skills.split(',').map((skill, i) => (
                                <Text key={i} style={styles.skillBadge}>
                                    {skill.trim()}
                                </Text>
                            ))}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};

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
                <div className="flex items-center gap-3">
                    <div className="group relative flex items-center gap-1 cursor-help">
                        {/* Tooltip Trigger */}
                        <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />

                        {/* Tooltip Content */}
                        <div className="invisible group-hover:visible absolute top-full right-0 mt-2 w-64 p-3 bg-popover border text-popover-foreground text-xs rounded-md shadow-md z-50">
                            <p className="font-semibold mb-1">What is ATS Mode?</p>
                            <p className="text-muted-foreground leading-relaxed">
                                Think of this like an X-Ray. Standard Mode is the beautiful PDF you download for humans.
                                ATS Mode shows the hidden plain text that hiring robots read.
                                If the text here looks clean, your resume is robot-friendly!
                            </p>
                        </div>
                    </div>

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
