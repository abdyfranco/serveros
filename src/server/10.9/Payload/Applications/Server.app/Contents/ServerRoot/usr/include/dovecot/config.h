/* config.h.  Generated from config.h.in by configure.  */
/* config.h.in.  Generated from configure.ac by autoheader.  */

/* Define if building universal (internal helper macro) */
/* #undef AC_APPLE_UNIVERSAL_BUILD */

/* APPLE */
#define APPLE_OS_X_SERVER /**/

/* Define if you have buggy CMSG macros */
/* #undef BUGGY_CMSG_MACROS */

/* Build with CDB support */
/* #undef BUILD_CDB */

/* Build with Berkeley DB support */
/* #undef BUILD_DB */

/* Built-in MySQL support */
/* #undef BUILD_MYSQL */

/* Built-in PostgreSQL support */
/* #undef BUILD_PGSQL */

/* Built-in SQLite support */
/* #undef BUILD_SQLITE */

/* GSSAPI support is built in */
#define BUILTIN_GSSAPI /**/

/* LDAP support is built in */
/* #undef BUILTIN_LDAP */

/* IMAP capabilities advertised in banner */
#define CAPABILITY_BANNER_STRING "IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE IDLE"

/* IMAP capabilities */
#define CAPABILITY_STRING "IMAP4rev1 LITERAL+ SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS THREAD=ORDEREDSUBJECT MULTIAPPEND URL-PARTIAL CATENATE UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 CONDSTORE QRESYNC ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS SPECIAL-USE BINARY MOVE"

/* Define if _XPG6 macro is needed for crypt() */
#define CRYPT_USE_XPG6 /**/

/* Build with extra debugging checks */
/* #undef DEBUG */

/* Define if your dev_t is a structure instead of integer type */
/* #undef DEV_T_STRUCT */

/* Path to /dev/urandom */
#define DEV_URANDOM_PATH "/dev/urandom"

/* Disable asserts */
/* #undef DISABLE_ASSERTS */

/* Dovecot ABI version */
#define DOVECOT_ABI_VERSION "2.2.ABIv5(2.2.5)"

/* Dovecot name */
#define DOVECOT_NAME "Dovecot"

/* Dovecot string */
#define DOVECOT_STRING "Dovecot 2.2.5"

/* Dovecot version */
#define DOVECOT_VERSION "2.2.5"

/* Dovecot major version */
#define DOVECOT_VERSION_MAJOR 2

/* Dovecot minor version */
#define DOVECOT_VERSION_MINOR 2

/* How to define flexible array members in structs */
#define FLEXIBLE_ARRAY_MEMBER 

/* Define to 1 if you have the `backtrace_symbols' function. */
#define HAVE_BACKTRACE_SYMBOLS 1

/* Define if you have bzlib library */
#define HAVE_BZLIB /**/

/* Define to 1 if you have the `clearenv' function. */
/* #undef HAVE_CLEARENV */

/* Define if you have the clock_gettime function */
/* #undef HAVE_CLOCK_GETTIME */

/* Define if you have struct dirent->d_type */
#define HAVE_DIRENT_D_TYPE /**/

/* Define to 1 if you have the <dirent.h> header file. */
#define HAVE_DIRENT_H 1

/* Define to 1 if you have the `dirfd' function. */
#define HAVE_DIRFD 1

/* Define to 1 if you have the <dlfcn.h> header file. */
#define HAVE_DLFCN_H 1

/* Define to 1 if you have the <execinfo.h> header file. */
#define HAVE_EXECINFO_H 1

/* Define to 1 if you have the `fallocate' function. */
/* #undef HAVE_FALLOCATE */

/* Define to 1 if you have the `fcntl' function. */
#define HAVE_FCNTL 1

/* Define if you have fdatasync() */
#define HAVE_FDATASYNC /**/

/* Define to 1 if you have the `flock' function. */
#define HAVE_FLOCK 1

/* Define if you have FreeBSD-compatible sendfile() */
/* #undef HAVE_FREEBSD_SENDFILE */

/* Define to 1 if you have the <gc/gc.h> header file. */
/* #undef HAVE_GC_GC_H */

/* Define to 1 if you have the <gc.h> header file. */
/* #undef HAVE_GC_H */

/* Define to 1 if you have the `getmntent' function. */
/* #undef HAVE_GETMNTENT */

/* Define to 1 if you have the `getmntinfo' function. */
#define HAVE_GETMNTINFO 1

/* Define to 1 if you have the `getpagesize' function. */
#define HAVE_GETPAGESIZE 1

/* Define to 1 if you have the `getpeereid' function. */
#define HAVE_GETPEEREID 1

/* Define to 1 if you have the `getpeerucred' function. */
/* #undef HAVE_GETPEERUCRED */

/* Define to 1 if you have the `glob' function. */
#define HAVE_GLOB 1

/* Define to 1 if you have the <glob.h> header file. */
#define HAVE_GLOB_H 1

/* Build with GNUTLS support */
/* #undef HAVE_GNUTLS */

/* Build with GSSAPI support */
#define HAVE_GSSAPI /**/

/* Define to 1 if you have the <gssapi/gssapi_ext.h> header file. */
/* #undef HAVE_GSSAPI_GSSAPI_EXT_H */

/* GSSAPI headers in gssapi/gssapi.h */
#define HAVE_GSSAPI_GSSAPI_H /**/

/* Define to 1 if you have the <gssapi/gssapi_krb5.h> header file. */
#define HAVE_GSSAPI_GSSAPI_KRB5_H 1

/* GSSAPI headers in gssapi.h */
#define HAVE_GSSAPI_H /**/

/* Define to 1 if you have the <gssapi_krb5.h> header file. */
/* #undef HAVE_GSSAPI_KRB5_H */

/* GSSAPI supports SPNEGO */
#define HAVE_GSSAPI_SPNEGO /**/

/* Define to 1 if you have the `gsskrb5_register_acceptor_identity' function.
   */
/* #undef HAVE_GSSKRB5_REGISTER_ACCEPTOR_IDENTITY */

/* Define if you have the iconv() function and it works. */
#define HAVE_ICONV 1

/* Define to 1 if you have the `inet_aton' function. */
#define HAVE_INET_ATON 1

/* Define to 1 if you have the <inttypes.h> header file. */
#define HAVE_INTTYPES_H 1

/* Build with IPv6 support */
#define HAVE_IPV6 /**/

/* Define to 1 if you have the <jfs/quota.h> header file. */
/* #undef HAVE_JFS_QUOTA_H */

/* Define to 1 if you have the `kevent' function. */
#define HAVE_KEVENT 1

/* Define to 1 if you have the `kqueue' function. */
#define HAVE_KQUEUE 1

/* Define to 1 if you have the `krb5_gss_register_acceptor_identity' function.
   */
#define HAVE_KRB5_GSS_REGISTER_ACCEPTOR_IDENTITY 1

/* libcap is installed for cap_init() */
/* #undef HAVE_LIBCAP */

/* Define to 1 if you have the <libgen.h> header file. */
#define HAVE_LIBGEN_H 1

/* Define if you have libwrap */
/* #undef HAVE_LIBWRAP */

/* Define to 1 if you have the <linux/dqblk_xfs.h> header file. */
/* #undef HAVE_LINUX_DQBLK_XFS_H */

/* Define to 1 if you have the <linux/falloc.h> header file. */
/* #undef HAVE_LINUX_FALLOC_H */

/* Define if you have Linux-compatible mremap() */
/* #undef HAVE_LINUX_MREMAP */

/* Define if you have Linux-compatible sendfile() */
/* #undef HAVE_LINUX_SENDFILE */

/* Define to 1 if you have the `lockf' function. */
#define HAVE_LOCKF 1

/* Define if you want textcat (Debian version) support for CLucene */
/* #undef HAVE_LUCENE_EXTTEXTCAT */

/* Define if you want stemming support for CLucene */
/* #undef HAVE_LUCENE_STEMMER */

/* Define if you want textcat support for CLucene */
/* #undef HAVE_LUCENE_TEXTCAT */

/* Define to 1 if you have the `madvise' function. */
#define HAVE_MADVISE 1

/* Define to 1 if you have the <malloc.h> header file. */
/* #undef HAVE_MALLOC_H */

/* Define to 1 if you have the <malloc_np.h> header file. */
/* #undef HAVE_MALLOC_NP_H */

/* Define to 1 if you have the `malloc_usable_size' function. */
/* #undef HAVE_MALLOC_USABLE_SIZE */

/* Define to 1 if you have the <memory.h> header file. */
#define HAVE_MEMORY_H 1

/* Define to 1 if you have the <mntent.h> header file. */
/* #undef HAVE_MNTENT_H */

/* Define if you have dynamic module support */
#define HAVE_MODULES /**/

/* Build with MySQL support */
/* #undef HAVE_MYSQL */

/* Define if your MySQL library has SSL functions */
/* #undef HAVE_MYSQL_SSL */

/* Define if your MySQL library supports setting cipher */
/* #undef HAVE_MYSQL_SSL_CIPHER */

/* Define if you don't have C99 compatible vsnprintf() call */
/* #undef HAVE_OLD_VSNPRINTF */

/* Build with OpenSSL support */
#define HAVE_OPENSSL /**/

/* Define to 1 if you have the <openssl/err.h> header file. */
#define HAVE_OPENSSL_ERR_H 1

/* Define if you have openssl/rand.h */
/* #undef HAVE_OPENSSL_RAND_H */

/* Define to 1 if you have the <openssl/ssl.h> header file. */
#define HAVE_OPENSSL_SSL_H 1

/* Define if you have pam/pam_appl.h */
/* #undef HAVE_PAM_PAM_APPL_H */

/* Define if you have pam_setcred() */
#define HAVE_PAM_SETCRED /**/

/* Build with PostgreSQL support */
/* #undef HAVE_PGSQL */

/* Define to 1 if you have the `posix_fadvise' function. */
/* #undef HAVE_POSIX_FADVISE */

/* Define if you have a working posix_fallocate() */
/* #undef HAVE_POSIX_FALLOCATE */

/* Define if libpq has PQescapeStringConn function */
/* #undef HAVE_PQESCAPE_STRING_CONN */

/* Define to 1 if you have the `pread' function. */
#define HAVE_PREAD 1

/* Define if you have prctl(PR_SET_DUMPABLE) */
/* #undef HAVE_PR_SET_DUMPABLE */

/* Define to 1 if you have the `quotactl' function. */
#define HAVE_QUOTACTL 1

/* Define to 1 if you have the <quota.h> header file. */
/* #undef HAVE_QUOTA_H */

/* Define if you have quota_open() */
/* #undef HAVE_QUOTA_OPEN */

/* Define if Q_QUOTACTL exists */
/* #undef HAVE_Q_QUOTACTL */

/* Define if you have RLIMIT_AS for setrlimit() */
#define HAVE_RLIMIT_AS /**/

/* Define if you have RLIMIT_CORE for getrlimit() */
#define HAVE_RLIMIT_CORE /**/

/* Define if you have RLIMIT_NPROC for setrlimit() */
#define HAVE_RLIMIT_NPROC /**/

/* Define if you wish to retrieve quota of NFS mounted mailboxes */
#define HAVE_RQUOTA /**/

/* Define to 1 if you have the <sasl.h> header file. */
/* #undef HAVE_SASL_H */

/* Define to 1 if you have the <sasl/sasl.h> header file. */
/* #undef HAVE_SASL_SASL_H */

/* Define if you have security/pam_appl.h */
#define HAVE_SECURITY_PAM_APPL_H /**/

/* Define to 1 if you have the `setegid' function. */
#define HAVE_SETEGID 1

/* Define to 1 if you have the `seteuid' function. */
#define HAVE_SETEUID 1

/* Define to 1 if you have the `setpriority' function. */
#define HAVE_SETPRIORITY 1

/* Define to 1 if you have the `setproctitle' function. */
/* #undef HAVE_SETPROCTITLE */

/* Define to 1 if you have the `setresgid' function. */
/* #undef HAVE_SETRESGID */

/* Define to 1 if you have the `setreuid' function. */
#define HAVE_SETREUID 1

/* Define to 1 if you have the `setrlimit' function. */
#define HAVE_SETRLIMIT 1

/* Define to 1 if you have the `sigaction' function. */
#define HAVE_SIGACTION 1

/* Define to 'int' if you don't have socklen_t */
#define HAVE_SOCKLEN_T /**/

/* Define if you have Solaris-compatible sendfile() */
/* #undef HAVE_SOLARIS_SENDFILE */

/* Build with SQLite3 support */
/* #undef HAVE_SQLITE */

/* Build with SSL/TLS support */
#define HAVE_SSL /**/

/* Build with OpenSSL compression */
#define HAVE_SSL_COMPRESSION /**/

/* Build with TLS hostname support */
#define HAVE_SSL_GET_SERVERNAME /**/

/* Define if you have statfs.f_mntfromname */
#define HAVE_STATFS_MNTFROMNAME /**/

/* Define if you have statvfs.f_mntfromname */
/* #undef HAVE_STATVFS_MNTFROMNAME */

/* Define if you have st_?tim timespec fields in struct stat */
/* #undef HAVE_STAT_XTIM */

/* Define if you have st_?timespec fields in struct stat */
#define HAVE_STAT_XTIMESPEC /**/

/* Define to 1 if you have the <stdint.h> header file. */
#define HAVE_STDINT_H 1

/* Define to 1 if you have the <stdlib.h> header file. */
#define HAVE_STDLIB_H 1

/* Define to 1 if you have the `strcasecmp' function. */
#define HAVE_STRCASECMP 1

/* Define to 1 if you have the `stricmp' function. */
/* #undef HAVE_STRICMP */

/* Define to 1 if you have the <strings.h> header file. */
#define HAVE_STRINGS_H 1

/* Define to 1 if you have the <string.h> header file. */
#define HAVE_STRING_H 1

/* Define if you have strtoimax function */
#define HAVE_STRTOIMAX /**/

/* Define to 1 if you have the `strtoll' function. */
#define HAVE_STRTOLL 1

/* Define to 1 if you have the `strtoq' function. */
#define HAVE_STRTOQ 1

/* Define to 1 if you have the `strtoull' function. */
#define HAVE_STRTOULL 1

/* Define if you have strtoumax function */
#define HAVE_STRTOUMAX /**/

/* Define to 1 if you have the `strtouq' function. */
#define HAVE_STRTOUQ 1

/* Define if struct sqblk.dqb_curblocks exists */
/* #undef HAVE_STRUCT_DQBLK_CURBLOCKS */

/* Define if struct sqblk.dqb_curspace exists */
/* #undef HAVE_STRUCT_DQBLK_CURSPACE */

/* Define if you have struct iovec */
#define HAVE_STRUCT_IOVEC /**/

/* Define to 1 if the system has the type `struct sockpeercred'. */
/* #undef HAVE_STRUCT_SOCKPEERCRED */

/* Define if you want to use systemd socket activation */
/* #undef HAVE_SYSTEMD */

/* Define to 1 if you have the <sys/event.h> header file. */
#define HAVE_SYS_EVENT_H 1

/* Define to 1 if you have the <sys/fs/quota_common.h> header file. */
/* #undef HAVE_SYS_FS_QUOTA_COMMON_H */

/* Define to 1 if you have the <sys/fs/ufs_quota.h> header file. */
/* #undef HAVE_SYS_FS_UFS_QUOTA_H */

/* Define to 1 if you have the <sys/mkdev.h> header file. */
/* #undef HAVE_SYS_MKDEV_H */

/* Define to 1 if you have the <sys/mnttab.h> header file. */
/* #undef HAVE_SYS_MNTTAB_H */

/* Define to 1 if you have the <sys/quota.h> header file. */
#define HAVE_SYS_QUOTA_H 1

/* Define to 1 if you have the <sys/resource.h> header file. */
#define HAVE_SYS_RESOURCE_H 1

/* Define to 1 if you have the <sys/select.h> header file. */
#define HAVE_SYS_SELECT_H 1

/* Define to 1 if you have the <sys/stat.h> header file. */
#define HAVE_SYS_STAT_H 1

/* Define to 1 if you have the <sys/sysmacros.h> header file. */
/* #undef HAVE_SYS_SYSMACROS_H */

/* Define to 1 if you have the <sys/time.h> header file. */
#define HAVE_SYS_TIME_H 1

/* Define to 1 if you have the <sys/types.h> header file. */
#define HAVE_SYS_TYPES_H 1

/* Define to 1 if you have the <sys/ucred.h> header file. */
#define HAVE_SYS_UCRED_H 1

/* Define to 1 if you have the <sys/uio.h> header file. */
#define HAVE_SYS_UIO_H 1

/* Define to 1 if you have the <sys/utsname.h> header file. */
#define HAVE_SYS_UTSNAME_H 1

/* Define to 1 if you have the <sys/vmount.h> header file. */
/* #undef HAVE_SYS_VMOUNT_H */

/* Define if you have struct tm->tm_gmtoff */
#define HAVE_TM_GMTOFF /**/

/* Define if you have typeof() */
#define HAVE_TYPEOF /**/

/* Define to 1 if you have the <ucontext.h> header file. */
/* #undef HAVE_UCONTEXT_H */

/* Define to 1 if you have the <ucred.h> header file. */
/* #undef HAVE_UCRED_H */

/* Define to 1 if you have the <ufs/ufs/quota.h> header file. */
/* #undef HAVE_UFS_UFS_QUOTA_H */

/* Define if you have uintmax_t (C99 type) */
#define HAVE_UINTMAX_T /**/

/* Define if you have uint_fast32_t (C99 type) */
#define HAVE_UINT_FAST32_T /**/

/* Define to 1 if you have the `uname' function. */
#define HAVE_UNAME 1

/* Define to 1 if you have the <unistd.h> header file. */
#define HAVE_UNISTD_H 1

/* Define to 1 if you have the `unsetenv' function. */
#define HAVE_UNSETENV 1

/* Define if you have a native uoff_t type */
/* #undef HAVE_UOFF_T */

/* Define to 1 if you have the `vsyslog' function. */
#define HAVE_VSYSLOG 1

/* Define to 1 if you have the `walkcontext' function. */
/* #undef HAVE_WALKCONTEXT */

/* Define to 1 if you have the `writev' function. */
#define HAVE_WRITEV 1

/* Define to 1 if you have the <xfs/xqm.h> header file. */
/* #undef HAVE_XFS_XQM_H */

/* Define if you have zlib library */
#define HAVE_ZLIB /**/

/* Define to 1 if the system has the type `_Bool'. */
#define HAVE__BOOL 1

/* Define if you have __gss_userok() */
/* #undef HAVE___GSS_USEROK */

/* Define as const if the declaration of iconv() needs const. */
#define ICONV_CONST 

/* Implement I/O loop with Linux 2.6 epoll() */
/* #undef IOLOOP_EPOLL */

/* Implement I/O loop with BSD kqueue() */
#define IOLOOP_KQUEUE /**/

/* Use Linux dnotify */
/* #undef IOLOOP_NOTIFY_DNOTIFY */

/* Use Linux inotify */
/* #undef IOLOOP_NOTIFY_INOTIFY */

/* Use BSD kqueue directory changes notificaton */
#define IOLOOP_NOTIFY_KQUEUE /**/

/* No special notify support */
/* #undef IOLOOP_NOTIFY_NONE */

/* Implement I/O loop with poll() */
/* #undef IOLOOP_POLL */

/* Implement I/O loop with select() */
/* #undef IOLOOP_SELECT */

/* Define if you have ldap_initialize */
/* #undef LDAP_HAVE_INITIALIZE */

/* Define if you have ldap_start_tls_s */
/* #undef LDAP_HAVE_START_TLS_S */

/* Define to the sub-directory in which libtool stores uninstalled libraries.
   */
#define LT_OBJDIR ".libs/"

/* APPLE */
#define MAC_OS_X /**/

/* List of compiled in mail storages */
#define MAIL_STORAGES "shared mdbox sdbox maildir mbox cydir imapc pop3c raw fail"

/* Required memory alignment */
#define MEM_ALIGN_SIZE 8

/* Define if shared mmaps don't get updated by write()s */
/* #undef MMAP_CONFLICTS_WRITE */

/* Dynamic module suffix */
#define MODULE_SUFFIX ".so"

/* Maximum value of off_t */
#define OFF_T_MAX LLONG_MAX

/* Name of package */
#define PACKAGE "dovecot"

/* Define to the address where bug reports for this package should be sent. */
#define PACKAGE_BUGREPORT "dovecot@dovecot.org"

/* Define to the full name of this package. */
#define PACKAGE_NAME "Dovecot"

/* Define to the full name and version of this package. */
#define PACKAGE_STRING "Dovecot 2.2.5"

/* Define to the one symbol short name of this package. */
#define PACKAGE_TARNAME "dovecot"

/* Define to the home page for this package. */
#define PACKAGE_URL ""

/* Define to the version of this package. */
#define PACKAGE_VERSION "2.2.5"

/* Support URL */
#define PACKAGE_WEBPAGE "http://www.dovecot.org/"

/* Build with BSD authentication support */
/* #undef PASSDB_BSDAUTH */

/* Build with checkpassword passdb support */
#define PASSDB_CHECKPASSWORD /**/

/* Build with LDAP support */
/* #undef PASSDB_LDAP */

/* Build with Open Directory support */
#define PASSDB_OD /**/

/* Build with PAM support */
#define PASSDB_PAM /**/

/* Build with passwd support */
#define PASSDB_PASSWD /**/

/* Build with passwd-file support */
#define PASSDB_PASSWD_FILE /**/

/* Build with shadow support */
/* #undef PASSDB_SHADOW */

/* Build with Tru64 SIA support */
/* #undef PASSDB_SIA */

/* Build with SQL support */
/* #undef PASSDB_SQL */

/* Build with vpopmail support */
/* #undef PASSDB_VPOPMAIL */

/* Defint if pread/pwrite implementation is broken */
/* #undef PREAD_BROKEN */

/* Define if pread/pwrite needs _XOPEN_SOURCE 500 */
/* #undef PREAD_WRAPPERS */

/* printf() format for size_t */
#define PRIuSIZE_T "lu"

/* printf() format for uoff_t */
#define PRIuUOFF_T "llu"

/* Define if process title can be changed by modifying argv */
#define PROCTITLE_HACK /**/

/* The size of `int', as computed by sizeof. */
#define SIZEOF_INT 4

/* The size of `long', as computed by sizeof. */
#define SIZEOF_LONG 8

/* The size of `long long', as computed by sizeof. */
#define SIZEOF_LONG_LONG 8

/* The size of `void *', as computed by sizeof. */
#define SIZEOF_VOID_P 8

/* Build SQL drivers as plugins */
/* #undef SQL_DRIVER_PLUGINS */

/* Maximum value of ssize_t */
#define SSIZE_T_MAX LONG_MAX

/* reasonable mntctl buffer size */
/* #undef STATIC_MTAB_SIZE */

/* Define to 1 if you have the ANSI C header files. */
#define STDC_HEADERS 1

/* APPLE made TIME_T_MAX_BITS and TIME_T_SIGNED into functions */


/* Define if unsetenv() returns int */
#define UNSETENV_RET_INT /**/

/* Define if off_t is int */
/* #undef UOFF_T_INT */

/* Define if off_t is long */
/* #undef UOFF_T_LONG */

/* Define if off_t is long long */
#define UOFF_T_LONG_LONG /**/

/* Build with checkpassword userdb support */
#define USERDB_CHECKPASSWORD /**/

/* Build with LDAP support */
/* #undef USERDB_LDAP */

/* Build with NSS module support */
/* #undef USERDB_NSS */

/* Build with Open Directory support */
#define USERDB_OD /**/

/* Build with passwd support */
#define USERDB_PASSWD /**/

/* Build with passwd-file support */
#define USERDB_PASSWD_FILE /**/

/* Build with prefetch userdb support */
#define USERDB_PREFETCH /**/

/* Build with SQL support */
/* #undef USERDB_SQL */

/* Build with vpopmail support */
/* #undef USERDB_VPOPMAIL */

/* Define if you want to use Boehm GC */
/* #undef USE_GC */

/* A 'va_copy' style function */
#define VA_COPY va_copy

/* 'va_lists' cannot be copies as values */
#define VA_COPY_AS_ARRAY 1

/* Version number of package */
#define VERSION "2.2.5"

/* Define WORDS_BIGENDIAN to 1 if your processor stores words with the most
   significant byte first (like Motorola and SPARC, unlike Intel). */
#if defined AC_APPLE_UNIVERSAL_BUILD
# if defined __BIG_ENDIAN__
#  define WORDS_BIGENDIAN __BIG_ENDIAN__
# endif
#else
# ifndef WORDS_BIGENDIAN
#  define WORDS_BIGENDIAN __BIG_ENDIAN__
# endif
#endif

/* Enable large inode numbers on Mac OS X 10.5.  */
#ifndef _DARWIN_USE_64_BIT_INODE
# define _DARWIN_USE_64_BIT_INODE 1
#endif

/* Number of bits in a file offset, on hosts where this is settable. */
/* #undef _FILE_OFFSET_BITS */

/* Define for large files, on AIX-style hosts. */
/* #undef _LARGE_FILES */

/* Define to `__inline__' or `__inline' if that's what the C compiler
   calls it, or to nothing if 'inline' is not supported under any name.  */
#ifndef __cplusplus
/* #undef inline */
#endif

/* Define to 'unsigned int' if you don't have it */
/* #undef size_t */

/* Define to 'int' if you don't have it */
/* #undef ssize_t */
