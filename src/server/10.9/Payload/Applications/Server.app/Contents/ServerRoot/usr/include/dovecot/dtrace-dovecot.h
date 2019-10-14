/*
 * Generated by dtrace(1M).
 */

#ifndef	_DTRACE_DOVECOT_H
#define	_DTRACE_DOVECOT_H

#include <unistd.h>

#ifdef	__cplusplus
extern "C" {
#endif

#define DOVECOT_STABILITY "___dtrace_stability$dovecot$v1$1_1_0_1_1_0_1_1_0_1_1_0_1_1_0"

#define DOVECOT_TYPEDEFS "___dtrace_typedefs$dovecot$v2"

#if !defined(DTRACE_PROBES_DISABLED) || !DTRACE_PROBES_DISABLED

#define	DOVECOT_IMAP_COMMAND_FINISH(arg0) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$imap__command__finish$v1$766f6964202a(arg0); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_IMAP_COMMAND_FINISH_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$imap__command__finish$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_IMAP_COMMAND_START(arg0) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$imap__command__start$v1$766f6964202a(arg0); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_IMAP_COMMAND_START_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$imap__command__start$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_IMAP_LOGIN_COMMAND_FINISH(arg0, arg1, arg2, arg3) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$imap__login__command__finish$v1$766f6964202a$63686172202a$766f6964202a$696e74(arg0, arg1, arg2, arg3); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_IMAP_LOGIN_COMMAND_FINISH_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$imap__login__command__finish$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_IMAP_LOGIN_COMMAND_START(arg0, arg1, arg2) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$imap__login__command__start$v1$766f6964202a$63686172202a$766f6964202a(arg0, arg1, arg2); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_IMAP_LOGIN_COMMAND_START_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$imap__login__command__start$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_OD_LOOKUP_CACHED(arg0, arg1, arg2) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$od__lookup__cached$v1$766f6964202a$63686172202a$766f6964202a(arg0, arg1, arg2); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_OD_LOOKUP_CACHED_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$od__lookup__cached$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_OD_LOOKUP_FINISH(arg0, arg1, arg2) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$od__lookup__finish$v1$766f6964202a$63686172202a$766f6964202a(arg0, arg1, arg2); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_OD_LOOKUP_FINISH_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$od__lookup__finish$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_OD_LOOKUP_START(arg0, arg1) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$od__lookup__start$v1$766f6964202a$63686172202a(arg0, arg1); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_OD_LOOKUP_START_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$od__lookup__start$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_OD_SACL_FINISH(arg0, arg1, arg2) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$od__sacl__finish$v1$766f6964202a$63686172202a$696e74(arg0, arg1, arg2); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_OD_SACL_FINISH_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$od__sacl__finish$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_OD_SACL_START(arg0, arg1) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$od__sacl__start$v1$766f6964202a$63686172202a(arg0, arg1); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_OD_SACL_START_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$od__sacl__start$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_POP3_COMMAND_FINISH(arg0, arg1, arg2, arg3) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$pop3__command__finish$v1$766f6964202a$63686172202a$63686172202a$696e74(arg0, arg1, arg2, arg3); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_POP3_COMMAND_FINISH_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$pop3__command__finish$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_POP3_COMMAND_START(arg0, arg1, arg2) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$pop3__command__start$v1$766f6964202a$63686172202a$63686172202a(arg0, arg1, arg2); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_POP3_COMMAND_START_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$pop3__command__start$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_POP3_LOGIN_COMMAND_FINISH(arg0, arg1, arg2, arg3) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$pop3__login__command__finish$v1$766f6964202a$63686172202a$63686172202a$696e74(arg0, arg1, arg2, arg3); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_POP3_LOGIN_COMMAND_FINISH_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$pop3__login__command__finish$v1(); \
		__asm__ volatile(""); \
		_r; })
#define	DOVECOT_POP3_LOGIN_COMMAND_START(arg0, arg1, arg2) \
do { \
	__asm__ volatile(".reference " DOVECOT_TYPEDEFS); \
	__dtrace_probe$dovecot$pop3__login__command__start$v1$766f6964202a$63686172202a$63686172202a(arg0, arg1, arg2); \
	__asm__ volatile(".reference " DOVECOT_STABILITY); \
} while (0)
#define	DOVECOT_POP3_LOGIN_COMMAND_START_ENABLED() \
	({ int _r = __dtrace_isenabled$dovecot$pop3__login__command__start$v1(); \
		__asm__ volatile(""); \
		_r; })


extern void __dtrace_probe$dovecot$imap__command__finish$v1$766f6964202a(const void *);
extern int __dtrace_isenabled$dovecot$imap__command__finish$v1(void);
extern void __dtrace_probe$dovecot$imap__command__start$v1$766f6964202a(const void *);
extern int __dtrace_isenabled$dovecot$imap__command__start$v1(void);
extern void __dtrace_probe$dovecot$imap__login__command__finish$v1$766f6964202a$63686172202a$766f6964202a$696e74(const void *, const char *, const void *, int);
extern int __dtrace_isenabled$dovecot$imap__login__command__finish$v1(void);
extern void __dtrace_probe$dovecot$imap__login__command__start$v1$766f6964202a$63686172202a$766f6964202a(const void *, const char *, const void *);
extern int __dtrace_isenabled$dovecot$imap__login__command__start$v1(void);
extern void __dtrace_probe$dovecot$od__lookup__cached$v1$766f6964202a$63686172202a$766f6964202a(const void *, const char *, const void *);
extern int __dtrace_isenabled$dovecot$od__lookup__cached$v1(void);
extern void __dtrace_probe$dovecot$od__lookup__finish$v1$766f6964202a$63686172202a$766f6964202a(const void *, const char *, const void *);
extern int __dtrace_isenabled$dovecot$od__lookup__finish$v1(void);
extern void __dtrace_probe$dovecot$od__lookup__start$v1$766f6964202a$63686172202a(const void *, const char *);
extern int __dtrace_isenabled$dovecot$od__lookup__start$v1(void);
extern void __dtrace_probe$dovecot$od__sacl__finish$v1$766f6964202a$63686172202a$696e74(const void *, const char *, int);
extern int __dtrace_isenabled$dovecot$od__sacl__finish$v1(void);
extern void __dtrace_probe$dovecot$od__sacl__start$v1$766f6964202a$63686172202a(const void *, const char *);
extern int __dtrace_isenabled$dovecot$od__sacl__start$v1(void);
extern void __dtrace_probe$dovecot$pop3__command__finish$v1$766f6964202a$63686172202a$63686172202a$696e74(const void *, const char *, const char *, int);
extern int __dtrace_isenabled$dovecot$pop3__command__finish$v1(void);
extern void __dtrace_probe$dovecot$pop3__command__start$v1$766f6964202a$63686172202a$63686172202a(const void *, const char *, const char *);
extern int __dtrace_isenabled$dovecot$pop3__command__start$v1(void);
extern void __dtrace_probe$dovecot$pop3__login__command__finish$v1$766f6964202a$63686172202a$63686172202a$696e74(const void *, const char *, const char *, int);
extern int __dtrace_isenabled$dovecot$pop3__login__command__finish$v1(void);
extern void __dtrace_probe$dovecot$pop3__login__command__start$v1$766f6964202a$63686172202a$63686172202a(const void *, const char *, const char *);
extern int __dtrace_isenabled$dovecot$pop3__login__command__start$v1(void);

#else

#define	DOVECOT_IMAP_COMMAND_FINISH(arg0) \
do { \
	} while (0)
#define	DOVECOT_IMAP_COMMAND_FINISH_ENABLED() (0)
#define	DOVECOT_IMAP_COMMAND_START(arg0) \
do { \
	} while (0)
#define	DOVECOT_IMAP_COMMAND_START_ENABLED() (0)
#define	DOVECOT_IMAP_LOGIN_COMMAND_FINISH(arg0, arg1, arg2, arg3) \
do { \
	} while (0)
#define	DOVECOT_IMAP_LOGIN_COMMAND_FINISH_ENABLED() (0)
#define	DOVECOT_IMAP_LOGIN_COMMAND_START(arg0, arg1, arg2) \
do { \
	} while (0)
#define	DOVECOT_IMAP_LOGIN_COMMAND_START_ENABLED() (0)
#define	DOVECOT_OD_LOOKUP_CACHED(arg0, arg1, arg2) \
do { \
	} while (0)
#define	DOVECOT_OD_LOOKUP_CACHED_ENABLED() (0)
#define	DOVECOT_OD_LOOKUP_FINISH(arg0, arg1, arg2) \
do { \
	} while (0)
#define	DOVECOT_OD_LOOKUP_FINISH_ENABLED() (0)
#define	DOVECOT_OD_LOOKUP_START(arg0, arg1) \
do { \
	} while (0)
#define	DOVECOT_OD_LOOKUP_START_ENABLED() (0)
#define	DOVECOT_OD_SACL_FINISH(arg0, arg1, arg2) \
do { \
	} while (0)
#define	DOVECOT_OD_SACL_FINISH_ENABLED() (0)
#define	DOVECOT_OD_SACL_START(arg0, arg1) \
do { \
	} while (0)
#define	DOVECOT_OD_SACL_START_ENABLED() (0)
#define	DOVECOT_POP3_COMMAND_FINISH(arg0, arg1, arg2, arg3) \
do { \
	} while (0)
#define	DOVECOT_POP3_COMMAND_FINISH_ENABLED() (0)
#define	DOVECOT_POP3_COMMAND_START(arg0, arg1, arg2) \
do { \
	} while (0)
#define	DOVECOT_POP3_COMMAND_START_ENABLED() (0)
#define	DOVECOT_POP3_LOGIN_COMMAND_FINISH(arg0, arg1, arg2, arg3) \
do { \
	} while (0)
#define	DOVECOT_POP3_LOGIN_COMMAND_FINISH_ENABLED() (0)
#define	DOVECOT_POP3_LOGIN_COMMAND_START(arg0, arg1, arg2) \
do { \
	} while (0)
#define	DOVECOT_POP3_LOGIN_COMMAND_START_ENABLED() (0)

#endif /* !defined(DTRACE_PROBES_DISABLED) || !DTRACE_PROBES_DISABLED */


#ifdef	__cplusplus
}
#endif

#endif	/* _DTRACE_DOVECOT_H */