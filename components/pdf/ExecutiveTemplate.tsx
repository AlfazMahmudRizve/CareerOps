
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { type ResumeData } from '../builder/ResumeForm';

// Register a standard font if allowed, otherwise fallback to Helvetica
// Font.register({ family: 'Open Sans', src: 'https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0e.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#000000',
        lineHeight: 1.4,
    },
    // Header Layout: Flex Row
    header: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    headerLeft: {
        width: '75%',
        paddingRight: 20,
        justifyContent: 'center',
    },
    headerRight: {
        width: '25%',
        alignItems: 'flex-end', // Align image to the right
        justifyContent: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        lineHeight: 1.2, // Fix overlap
    },
    title: {
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 8, // Split from contact info
        color: '#333333',
    },
    contactRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        fontSize: 9,
        color: '#333333',
        gap: 10, // Modern gap property (react-pdf supports this in recent versions) or fallback to margin on items
    },
    contactItem: {
        // marginRight: 10, // Removed in favor of gap, or keep as fallback
    },
    profileImage: {
        width: 80,
        height: 80,
        objectFit: 'cover',
        // borderRadius: 4, // Optional
    },
    // Section Headers
    sectionTitle: {
        flexDirection: 'row', // To insure full width background if needed, but here just borders
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#000000',
        borderBottomWidth: 1,
        borderBottomColor: '#000000',
        paddingVertical: 5, // Increased padding
        marginBottom: 10,
        marginTop: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitleText: {
        fontSize: 11,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        textAlign: 'center',
    },
    // Work Experience Items
    experienceItem: {
        marginBottom: 10,
    },
    row1: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end', // User requested flex-end
        marginBottom: 2,
    },
    jobTitle: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    dateRange: {
        fontSize: 10,
        textAlign: 'right',
        minWidth: 100, // Fixed width for alignment
    },
    row2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 10,
        fontWeight: 'bold',
        fontStyle: 'italic', // "Bold/Italic"
    },
    location: {
        fontSize: 10,
        fontStyle: 'italic',
        textAlign: 'right',
    },
    // Lists & Bullet Points
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    bullet: {
        width: 10,
        fontSize: 10,
        textAlign: 'center',
    },
    bulletContent: {
        flex: 1,
        fontSize: 10,
        textAlign: 'justify', // Cleaner look for paragraphs
    },
    // Skills Grid
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillColumn: {
        width: '33.33%', // 3 Columns
        flexDirection: 'column',
    },
    skillItem: {
        fontSize: 10,
        marginBottom: 2,
    },
});

const BulletPoint = ({ children }: { children: string }) => (
    <View style={styles.bulletPoint}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletContent}>{children}</Text>
    </View>
);

export const ExecutiveTemplate = ({ data }: { data: ResumeData }) => {
    // Helper for contact array
    const contactItems = [
        data.phone,
        data.email,
        data.linkedin,
        data.portfolio,
    ].filter(Boolean);

    // Placeholder for missing Title/Image/Location
    const placeholderImage = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; // Standard square placeholder
    const professionalTitle = "Professional"; // Or leave empty if preferred, strictly follows structure though.

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.name}>{data.fullName}</Text>
                        <Text style={styles.title}>{professionalTitle}</Text>
                        <View style={styles.contactRow}>
                            {contactItems.map((item, index) => (
                                <Text key={index} style={styles.contactItem}>
                                    {item}
                                    {index < contactItems.length - 1 ? '   |   ' : ''}
                                </Text>
                            ))}
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        {/* Note: React-PDF Image component requires a valid src (URL or base64) */}
                        <Image style={styles.profileImage} src={placeholderImage} />
                    </View>
                </View>

                {/* Summary */}
                {data.summary && (
                    <View>
                        {/* Optional: Add a section title for Summary or just the text? Reference usually puts it below header directly or with a title. 
                             The prompt reference image shows a summary text blurb without a "SUMMARY" border title, just text.
                             "The CV Guy is a professional..."
                             I will render it as plain text block.
                         */}
                        <Text style={{ marginBottom: 10, textAlign: 'justify' }}>{data.summary}</Text>
                    </View>
                )}

                {/* Work Experience */}
                {data.experience.length > 0 && (
                    <View>
                        <View style={styles.sectionTitle}>
                            <Text style={styles.sectionTitleText}>Work Experience</Text>
                        </View>
                        {data.experience.map((exp, i) => (
                            <View key={i} style={styles.experienceItem}>
                                {/* Row 1: Job Title - Date */}
                                <View style={styles.row1}>
                                    <Text style={styles.jobTitle}>{exp.role}</Text>
                                    <Text style={styles.dateRange}>{exp.startDate} - {exp.endDate}</Text>
                                </View>
                                {/* Row 2: Company - Location */}
                                <View style={styles.row2}>
                                    <Text style={styles.companyName}>{exp.company}</Text>
                                    <Text style={styles.location}>Remote / On-site</Text> {/* Placeholder location */}
                                </View>
                                {/* Description / Bullets */}
                                {exp.description ? (
                                    <View>
                                        {/* Split by newlines or periods for bullets? User asked for "Lists: Create a bullet point style" */}
                                        {/* If description is a big block, we might just wrap it. 
                                            But best practice for "Executive" is bullets. 
                                            Let's try to split by newline if possible, or just render it. 
                                            If it's a single string, we can just bullet the whole thing or leave it plain.
                                            Let's assume it might contain newlines.
                                        */}
                                        {exp.description.split('\n').map((line, idx) => (
                                            line.trim() && <BulletPoint key={idx}>{line.trim()}</BulletPoint>
                                        ))}
                                    </View>
                                ) : null}
                            </View>
                        ))}
                    </View>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                    <View>
                        <View style={styles.sectionTitle}>
                            <Text style={styles.sectionTitleText}>Educational Qualifications</Text>
                        </View>
                        {data.education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                {/* Format: MBA in Lorem - 2018 | North South University | CGPA: 3.50 */}
                                {/* We'll approximate this single line format or compact rows */}
                                <Text style={{ fontSize: 10 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{edu.degree}</Text>
                                    <Text> | {edu.school}</Text>
                                    <Text> | {edu.startDate} - {edu.endDate}</Text>
                                </Text>
                                {edu.description ? <Text style={{ fontSize: 9, marginTop: 2, color: '#444' }}>{edu.description}</Text> : null}
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects (Optional, but good to include if data exists) */}
                {data.projects.length > 0 && (
                    <View>
                        <View style={styles.sectionTitle}>
                            <Text style={styles.sectionTitleText}>Key Projects</Text>
                        </View>
                        {data.projects.map((proj, i) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <View style={styles.row1}>
                                    <Text style={styles.jobTitle}>{proj.title}</Text>
                                    <Text style={styles.dateRange}>{proj.link}</Text>
                                </View>
                                <Text style={{ fontSize: 10, fontStyle: 'italic', marginBottom: 2 }}>{proj.techStack}</Text>
                                <Text style={{ fontSize: 10 }}>{proj.description}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills - 3 Column Grid */}
                {data.skills && (
                    <View>
                        <View style={styles.sectionTitle}>
                            <Text style={styles.sectionTitleText}>Core Skills</Text>
                        </View>
                        <View style={styles.skillsGrid}>
                            {/* We need to split the skills string into an array and then distribute into 3 columns */}
                            {(() => {
                                const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean);
                                const perColumn = Math.ceil(skillsArray.length / 3);
                                const col1 = skillsArray.slice(0, perColumn);
                                const col2 = skillsArray.slice(perColumn, perColumn * 2);
                                const col3 = skillsArray.slice(perColumn * 2);

                                return (
                                    <>
                                        <View style={styles.skillColumn}>
                                            {col1.map((skill, i) => <BulletPoint key={i}>{skill}</BulletPoint>)}
                                        </View>
                                        <View style={styles.skillColumn}>
                                            {col2.map((skill, i) => <BulletPoint key={i}>{skill}</BulletPoint>)}
                                        </View>
                                        <View style={styles.skillColumn}>
                                            {col3.map((skill, i) => <BulletPoint key={i}>{skill}</BulletPoint>)}
                                        </View>
                                    </>
                                );
                            })()}
                        </View>
                    </View>
                )}
            </Page>
        </Document>
    );
};
